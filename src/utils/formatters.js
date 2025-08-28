// --- FORMATTING UTILITIES ---

export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  if (num > 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (num > 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num > 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num > 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString();
};

export const formatCurrency = (num) => {
  if (num === null || num === undefined) return 'N/A';
  if (num < 1) return `$${num.toFixed(6)}`;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
