import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { fetchCoins } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CryptoCardSkeleton } from '../common/Skeletons';
import ErrorDisplay from '../common/ErrorDisplay';

const CryptocurrenciesPage = ({ onCoinClick }) => {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const COINS_PER_PAGE = 50;

  useEffect(() => {
    const fetchCoinsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCoins(page, COINS_PER_PAGE);
        setCoins(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoinsData();
  }, [page]);

  const filteredCoins = useMemo(() => {
    return coins.filter((coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coins, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 py-6 bg-gradient-to-b from-teal-900/50 to-gray-900/80 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-teal-200 tracking-tight">Cryptocurrencies</h1>
        <p className="text-lg text-gray-300 max-w-lg mx-auto">Explore top coins by market cap</p>
      </div>

      {error ? (
        <ErrorDisplay message={error} />
      ) : (
        <>
          <div className="relative">
            <input
              type="text"
              placeholder="Search coins..."
              className="w-full px-4 py-2 bg-gray-800/70 border border-teal-900/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-teal-700/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-teal-900/30 shadow-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/70">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Coin</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Market Cap</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">24h Change</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">7d Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? Array.from({ length: 10 }).map((_, i) => <tr key={i}><td colSpan="6"><CryptoCardSkeleton /></td></tr>) : filteredCoins.map((coin) => (
                  <tr key={coin.id} className="hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer" onClick={() => onCoinClick(coin.id)}>
                    <td className="px-4 py-2 text-sm text-white">{coin.market_cap_rank}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-white">{coin.name}</p>
                          <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-white">{formatCurrency(coin.current_price)}</td>
                    <td className="px-4 py-2 text-sm text-white">{formatNumber(coin.market_cap)}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-24 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={coin.sparkline_in_7d?.price.map((p, i) => ({ time: i, price: p })) || []}>
                            <Line type="monotone" dataKey="price" stroke={coin.price_change_percentage_24h >= 0 ? '#34D399' : '#F87171'} strokeWidth={1} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center space-x-3 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-3 py-1 bg-gray-800/70 text-white text-sm rounded-md disabled:opacity-50 hover:bg-gray-700 transition-colors duration-300 border border-teal-900/30"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="px-3 py-1 bg-gray-800/70 text-white text-sm rounded-md border border-teal-900/30">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading || coins.length < COINS_PER_PAGE}
              className="px-3 py-1 bg-gray-800/70 text-white text-sm rounded-md disabled:opacity-50 hover:bg-gray-700 transition-colors duration-300 border border-teal-900/30"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CryptocurrenciesPage;
