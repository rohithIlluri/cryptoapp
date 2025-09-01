// --- API CONFIGURATION ---
export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
export const CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data/v2';
const CRYPTOCOMPARE_API_KEY = process.env.REACT_APP_CRYPTOCOMPARE_KEY;

// --- Lightweight caching + dedup + retry wrapper ---
const cacheStore = new Map(); // key -> { expiry: number, data: any }
const inflight = new Map(); // key -> Promise<any>

// Per-host simple rate limiter (min gap between requests)
const HOST_LIMITS = new Map([
  ['api.coingecko.com', { minIntervalMs: 1200 }],
  ['min-api.cryptocompare.com', { minIntervalMs: 800 }],
  ['www.cryptocompare.com', { minIntervalMs: 800 }],
]);
const hostCooldownUntil = new Map(); // host -> timestamp until which we should avoid hitting

// Per-host serialization to prevent bursts
const hostQueues = new Map(); // host -> Promise
const hostNextAvailableAt = new Map(); // host -> timestamp

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scheduleHostRequest(url) {
  try {
    const { host } = new URL(url);
    const limit = HOST_LIMITS.get(host);
    if (!limit) return;
    const prev = hostQueues.get(host) || Promise.resolve();
    const chained = prev.then(async () => {
      const now = Date.now();
      const cooldown = Math.max(0, (hostCooldownUntil.get(host) || 0) - now);
      const availableAt = hostNextAvailableAt.get(host) || 0;
      const wait = Math.max(0, cooldown, availableAt - now);
      if (wait > 0) await sleep(wait);
      hostNextAvailableAt.set(host, Date.now() + limit.minIntervalMs);
    });
    // Swallow errors in queue to not break chain
    hostQueues.set(host, chained.catch(() => {}));
    await chained;
  } catch (_) {
    // ignore URL parse errors
  }
}

function setHostCooldown(url, ms) {
  try {
    const { host } = new URL(url);
    hostCooldownUntil.set(host, Date.now() + ms);
  } catch (_) {
    // ignore
  }
}

async function fetchWithRetry(url, fetchInit, retries = 2) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    try {
      // Serialize per-host and respect cooldowns
      await scheduleHostRequest(url);

      const res = await fetch(url, fetchInit);
      if (!res.ok) {
        // Surface Retry-After for 429
        if (res.status === 429) {
          const retryAfter = parseInt(res.headers.get('Retry-After') || '0', 10);
          const backoff = (retryAfter ? retryAfter * 1000 : 800 * Math.pow(2, attempt)) + Math.floor(Math.random() * 400);
          setHostCooldown(url, backoff);
          if (attempt < retries) {
            await sleep(backoff);
            attempt += 1;
            continue;
          }
        }
        // Retry on 5xx
        if (res.status >= 500 && attempt < retries) {
          const backoff = 600 * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
          await sleep(backoff);
          attempt += 1;
          continue;
        }
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text || 'Request failed'}`);
      }
      return res.json();
    } catch (err) {
      lastErr = err;
      if (attempt >= retries) break;
      const backoff = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
      await sleep(backoff);
      attempt += 1;
    }
  }
  throw lastErr || new Error('Network error');
}

async function fetchJson(url, { ttlMs = 0, retries = 2, headers = {}, signal } = {}) {
  const key = url;
  const now = Date.now();
  const cached = cacheStore.get(key);
  // Serve fresh cache
  if (cached && cached.expiry > now) return cached.data;
  // Serve in-flight if present
  if (inflight.has(key)) return inflight.get(key);

  const fetchInit = {
    method: 'GET',
    headers: { Accept: 'application/json', ...headers },
    signal,
  };
  const p = fetchWithRetry(url, fetchInit, retries)
    .then((data) => {
      if (ttlMs > 0) cacheStore.set(key, { expiry: Date.now() + ttlMs, data });
      inflight.delete(key);
      return data;
    })
    .catch((e) => {
      inflight.delete(key);
      // Stale-while-error: if we have any cached data (even stale), return it to keep UI populated
      if (cached && cached.data) return cached.data;
      throw e;
    });
  inflight.set(key, p);
  return p;
}

// --- API SERVICE FUNCTIONS ---

export const fetchGlobalStats = async () => {
  // Low-volatility; cache longer to reduce rate limits
  return fetchJson(`${COINGECKO_API_URL}/global`, { ttlMs: 300_000 });
};

export const fetchTrendingCoins = async () => {
  return fetchJson(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=20&page=1&sparkline=false`, { ttlMs: 300_000 });
};

export const fetchNews = async () => {
  const keyParam = CRYPTOCOMPARE_API_KEY ? `&api_key=${encodeURIComponent(CRYPTOCOMPARE_API_KEY)}` : '';
  return fetchJson(`${CRYPTOCOMPARE_API_URL}/news/?lang=EN${keyParam}`, { ttlMs: 300_000, retries: 3 });
};

export const fetchCoins = async (page = 1, perPage = 50) => {
  return fetchJson(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`, { ttlMs: 60_000 });
};

export const fetchCoinDetails = async (coinId) => {
  return fetchJson(`${COINGECKO_API_URL}/coins/${encodeURIComponent(coinId)}`, { ttlMs: 120_000 });
};

export const fetchCoinHistory = async (coinId, days, interval) => {
  const safeId = encodeURIComponent(coinId);
  const safeDays = days === 'max' ? 'max' : encodeURIComponent(String(days));
  const base = `${COINGECKO_API_URL}/coins/${safeId}/market_chart?vs_currency=usd&days=${safeDays}`;
  const url = interval === 'daily' ? `${base}&interval=daily` : base;
  const ttl = days === '1' ? 30_000 : days === '7' ? 90_000 : days === '30' ? 180_000 : days === '90' ? 240_000 : days === '180' ? 300_000 : days === '365' ? 480_000 : 600_000;
  // Use caching + retry and fall back to alternate cadence if first attempt fails
  try {
    return await fetchJson(url, { ttlMs: ttl, retries: 2 });
  } catch (_) {
    const fallbackUrl = interval === 'daily' ? base : `${base}&interval=daily`;
    return await fetchJson(fallbackUrl, { ttlMs: ttl, retries: 2 });
  }
};
