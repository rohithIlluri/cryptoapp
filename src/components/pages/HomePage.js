import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Server } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { fetchGlobalStats, fetchTrendingCoins, fetchNews } from '../../services/api';
import { formatNumber } from '../../utils/formatters';
import StatCard from '../ui/StatCard';
import CryptoCard from '../ui/CryptoCard';
import NewsCard from '../ui/NewsCard';
import { CryptoCardSkeleton, NewsCardSkeleton } from '../common/Skeletons';
import ErrorDisplay from '../common/ErrorDisplay';

const HomePage = ({ onCoinClick, onShowMoreClick }) => {
  const [globalStats, setGlobalStats] = useState(null);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [globalRes, trendingRes, newsRes] = await Promise.all([
          fetchGlobalStats(),
          fetchTrendingCoins(),
          fetchNews(),
        ]);
        setGlobalStats(globalRes.data);
        setTrendingCoins(trendingRes || []);
        setNews(newsRes?.Data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!globalStats) return {};
    const marketCapData = globalStats.market_cap_percentage ? 
      Object.entries(globalStats.market_cap_percentage)
        .filter(([_, value]) => value && value > 0.1)
        .map(([key, value]) => ({ name: key.toUpperCase(), value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) : [];
    return {
      totalMarketCap: `$${formatNumber(globalStats.total_market_cap?.usd)}`,
      marketCapChange: globalStats.market_cap_change_percentage_24h_usd,
      totalVolume: `$${formatNumber(globalStats.total_volume?.usd)}`,
      totalCoins: formatNumber(globalStats.active_cryptocurrencies),
      dominanceChart: marketCapData,
    };
  }, [globalStats]);

  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 bg-gradient-to-b from-teal-900/50 to-gray-900/80 rounded-lg shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-teal-200 tracking-tight">CryptoPulse Dashboard</h1>
        <p className="text-lg text-gray-300 max-w-xl mx-auto">Real-time crypto insights, trends, and news at your fingertips.</p>
      </div>

      {/* Global Stats */}
      <div>
        <h2 className="text-2xl font-bold text-teal-200 mb-4">Market Snapshot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<DollarSign className="text-teal-400" size={20} />} title="Market Cap" value={stats.totalMarketCap} change={stats.marketCapChange} isLoading={isLoading} />
          <StatCard icon={<TrendingUp className="text-green-400" size={20} />} title="24h Volume" value={stats.totalVolume} isLoading={isLoading} />
          <StatCard icon={<Server className="text-purple-400" size={20} />} title="Active Coins" value={stats.totalCoins} isLoading={isLoading} />
        </div>
      </div>

      {/* Market Dominance */}
      <div className="bg-gray-800/70 p-6 rounded-lg shadow-lg border border-teal-900/30">
        <h3 className="text-xl font-bold text-teal-200 mb-4">Dominance Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.dominanceChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '6px' }} />
            <Bar dataKey="value" fill="#34D399" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trending Coins */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-teal-200">Trending Coins</h2>
            <p className="text-gray-400 text-sm">Top movers in the market</p>
          </div>
          <button onClick={() => onShowMoreClick('cryptocurrencies')} className="px-4 py-2 bg-teal-700 text-white text-sm rounded-md hover:bg-teal-600 transition-colors duration-300">See All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? Array.from({ length: 8 }).map((_, i) => <CryptoCardSkeleton key={i} />) : trendingCoins.slice(0, 8).map((item) => (
            <div key={item.id} className="bg-gray-800/70 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-900/30 hover:border-teal-700/50 cursor-pointer" onClick={() => onCoinClick(item.id)}>
              <div className="flex items-center space-x-3 mb-2">
                <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="font-medium text-white text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-400 uppercase">{item.symbol}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <p className="text-gray-500">Rank: {item.market_cap_rank}</p>
                <p className={`font-medium ${item.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.price_change_percentage_24h?.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest News */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-teal-200">Latest News</h2>
            <p className="text-gray-400 text-sm">Stay updated with crypto headlines</p>
          </div>
          <button onClick={() => onShowMoreClick('news')} className="px-4 py-2 bg-teal-700 text-white text-sm rounded-md hover:bg-teal-600 transition-colors duration-300">See All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />) : news.slice(0, 6).map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
