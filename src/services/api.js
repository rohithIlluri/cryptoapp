// --- API CONFIGURATION ---
export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
export const CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data/v2';

// --- API SERVICE FUNCTIONS ---

export const fetchGlobalStats = async () => {
  const response = await fetch(`${COINGECKO_API_URL}/global`);
  if (!response.ok) throw new Error('Failed to fetch global stats');
  return response.json();
};

export const fetchTrendingCoins = async () => {
  const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=20&page=1&sparkline=false`);
  if (!response.ok) throw new Error('Failed to fetch trending coins');
  return response.json();
};

export const fetchNews = async () => {
  const response = await fetch(`${CRYPTOCOMPARE_API_URL}/news/?lang=EN`);
  if (!response.ok) throw new Error('Failed to fetch news');
  return response.json();
};

export const fetchCoins = async (page = 1, perPage = 50) => {
  const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`);
  if (!response.ok) throw new Error('Failed to fetch coins');
  return response.json();
};

export const fetchCoinDetails = async (coinId) => {
  const response = await fetch(`${COINGECKO_API_URL}/coins/${coinId}`);
  if (!response.ok) throw new Error('Failed to fetch coin details');
  return response.json();
};

export const fetchCoinHistory = async (coinId, days) => {
  const response = await fetch(`${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days === 'max' ? 'max' : days}`);
  if (!response.ok) throw new Error('Failed to fetch coin history');
  return response.json();
};
