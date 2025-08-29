import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Coins, TrendingUpIcon, TrendingDown, Activity, Globe, ArrowRight } from 'lucide-react';
import { fetchGlobalStats, fetchTrendingCoins, fetchNews } from '../../services/api';
import { formatNumber } from '../../utils/formatters';
import StatCard from '../ui/StatCard';
import CryptoCard from '../ui/CryptoCard';
import NewsCard from '../ui/NewsCard';
import { CryptoCardSkeleton, NewsCardSkeleton } from '../common/Skeletons';
import ErrorDisplay from '../common/ErrorDisplay';

const HomePage = ({ onCoinClick, onShowMoreClick }) => {
  const [globalData, setGlobalData] = useState(null);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [globalRes, trendingRes, newsRes] = await Promise.all([
        fetchGlobalStats(),
        fetchTrendingCoins(),
        fetchNews(),
      ]);
      
      setGlobalData(globalRes.data);
      setTrendingCoins(trendingRes || []);
      setNews(newsRes?.Data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getMarketSentiment = () => {
    if (!globalData?.market_cap_change_percentage_24h_usd) return 'neutral';
    const change = globalData.market_cap_change_percentage_24h_usd;
    if (change > 2) return 'bullish';
    if (change < -2) return 'bearish';
    return 'neutral';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4" />;
      case 'bearish': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTopGainers = () => {
    return trendingCoins
      .filter(coin => coin.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 3);
  };

  const getTopLosers = () => {
    return trendingCoins
      .filter(coin => coin.price_change_percentage_24h < 0)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 3);
  };

  if (error) {
    return (
      <ErrorDisplay 
        message={error} 
        onRetry={fetchData}
        details="This could be due to API rate limits, network issues, or temporary service unavailability."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8 bg-gray-100 rounded-lg border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
          CryptoPulse Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real-time cryptocurrency insights, market trends, and breaking news
        </p>
        
        {/* Market Sentiment & Last Updated */}
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getSentimentColor(getMarketSentiment())}`}>
            {getSentimentIcon(getMarketSentiment())}
            <span className="font-medium capitalize">{getMarketSentiment()} Market</span>
          </div>
          {lastUpdated && (
            <div className="text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Market Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Market Snapshot</h2>
          
          {/* Timeframe Selector */}
          <div className="flex space-x-2">
            {['1h', '24h', '7d', '30d'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === period
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<DollarSign className="text-gray-600" size={20} />} 
            title="Market Cap" 
            value={globalData ? `$${formatNumber(globalData.total_market_cap?.usd)}` : 'Loading...'} 
            change={globalData?.market_cap_change_percentage_24h_usd} 
            isLoading={isLoading} 
          />
          <StatCard 
            icon={<TrendingUp className="text-gray-600" size={20} />} 
            title="24h Volume" 
            value={globalData ? `$${formatNumber(globalData.total_volume?.usd)}` : 'Loading...'} 
            isLoading={isLoading} 
          />
          <StatCard 
            icon={<Coins className="text-gray-600" size={20} />} 
            title="Active Coins" 
            value={globalData ? formatNumber(globalData.active_cryptocurrencies) : 'Loading...'} 
            isLoading={isLoading} 
          />
          <StatCard 
            icon={<Globe className="text-gray-600" size={20} />} 
            title="Market Dominance" 
            value={globalData ? `${((globalData.market_cap_percentage?.btc || 0) + (globalData.market_cap_percentage?.eth || 0)).toFixed(1)}%` : 'Loading...'} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-black mb-4">Top Gainers (24h)</h3>
          <div className="space-y-3">
            {getTopGainers().map((coin) => (
              <div 
                key={coin.id}
                onClick={() => onCoinClick(coin.id)}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={coin.image} 
                    alt={coin.name} 
                    className="w-8 h-8 rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-black">{coin.symbol}</p>
                    <p className="text-sm text-gray-500">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-black">${coin.current_price?.toFixed(2)}</p>
                  <p className="text-sm text-green-600">+{coin.price_change_percentage_24h?.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-black mb-4">Top Losers (24h)</h3>
          <div className="space-y-3">
            {getTopLosers().map((coin) => (
              <div 
                key={coin.id}
                onClick={() => onCoinClick(coin.id)}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={coin.image} 
                    alt={coin.name} 
                    className="w-8 h-8 rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-black">{coin.symbol}</p>
                    <p className="text-sm text-gray-500">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-black">${coin.current_price?.toFixed(2)}</p>
                  <p className="text-sm text-red-600">{coin.price_change_percentage_24h?.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Coins */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Trending Coins</h2>
            <p className="text-gray-600">Top movers in the market</p>
          </div>
          <button 
            onClick={() => onShowMoreClick('cryptocurrencies')} 
            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <span>See All</span>
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <CryptoCardSkeleton key={i} />)
          ) : (
            trendingCoins.slice(0, 6).map((coin) => (
              <CryptoCard
                key={coin.id}
                coin={coin}
                onCoinClick={onCoinClick}
                showSparkline={true}
              />
            ))
          )}
        </div>
      </div>

      {/* Latest News */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Latest News</h2>
            <p className="text-gray-600">Stay updated with crypto market news</p>
          </div>
          <button 
            onClick={() => onShowMoreClick('news')} 
            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <span>See All</span>
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)
          ) : (
            news.slice(0, 6).map((article) => (
              <div key={article.id} className="h-full">
                <NewsCard article={article} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-black mb-4 text-center">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
            <TrendingUp className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-black">Market Analysis</span>
          </button>
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
            <Activity className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-black">Portfolio</span>
          </button>
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
            <Globe className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-black">News Feed</span>
          </button>
          <button className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center">
            <TrendingUpIcon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-black">Watchlist</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
