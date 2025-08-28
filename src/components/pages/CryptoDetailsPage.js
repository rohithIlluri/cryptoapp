import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Server, ChevronUp, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchCoinDetails, fetchCoinHistory } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CryptoDetailsSkeleton } from '../common/Skeletons';
import ErrorDisplay from '../common/ErrorDisplay';

const CryptoDetailsPage = ({ coinId }) => {
  const [coin, setCoin] = useState(null);
  const [history, setHistory] = useState([]);
  const [timePeriod, setTimePeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const timePeriods = [
    { value: '24h', label: '24H', days: 1 },
    { value: '7d', label: '7D', days: 7 },
    { value: '30d', label: '30D', days: 30 },
    { value: '1y', label: '1Y', days: 365 },
    { value: 'max', label: 'MAX', days: 'max' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const days = timePeriods.find((p) => p.value === timePeriod)?.days || 7;
        const [coinData, historyData] = await Promise.all([
          fetchCoinDetails(coinId),
          fetchCoinHistory(coinId, days),
        ]);
        setCoin(coinData);
        setHistory(historyData.prices?.map((price) => ({ 
          time: new Date(price[0]).toLocaleDateString(), 
          price: price[1] 
        })) || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [coinId, timePeriod]);

  const stats = useMemo(() => {
    if (!coin) return [];
    return [
      { title: 'Market Cap', value: formatNumber(coin.market_data?.market_cap?.usd), change: coin.market_data?.market_cap_change_percentage_24h, icon: <DollarSign className="text-teal-400" size={18} /> },
      { title: '24h Volume', value: formatNumber(coin.market_data?.total_volume?.usd), icon: <TrendingUp className="text-green-400" size={18} /> },
      { title: 'Circ. Supply', value: formatNumber(coin.market_data?.circulating_supply), icon: <Server className="text-purple-400" size={18} /> },
      { title: 'All-Time High', value: formatCurrency(coin.market_data?.ath?.usd), change: coin.market_data?.ath_change_percentage?.usd, icon: <ChevronUp className="text-yellow-400" size={18} /> },
      { title: 'All-Time Low', value: formatCurrency(coin.market_data?.atl?.usd), change: coin.market_data?.atl_change_percentage?.usd, icon: <ChevronDown className="text-red-400" size={18} /> },
    ];
  }, [coin]);

  if (isLoading) return <CryptoDetailsSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!coin) return <p className="text-gray-400 text-center text-lg">No data available.</p>;

  const description = coin.description?.en ? coin.description.en.split('. ').slice(0, 5).join('. ') + '.' : 'No description available.';

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 border-b border-teal-900/30 pb-4">
        <img src={coin.image?.large} alt={coin.name} className="w-12 h-12 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold text-teal-200">{coin.name} ({coin.symbol.toUpperCase()})</h1>
          <p className="text-sm text-gray-400">Rank #{coin.market_cap_rank} • {formatCurrency(coin.market_data.current_price.usd)}</p>
        </div>
      </div>

      <div className="bg-gray-800/70 p-4 rounded-lg shadow-lg border border-teal-900/30">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-teal-200">Price History</h2>
          <div className="flex space-x-2">
            {timePeriods.map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-300 ${
                  timePeriod === period.value ? 'bg-teal-700 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} tickFormatter={formatCurrency} />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '6px' }} formatter={formatCurrency} />
            <Line type="monotone" dataKey="price" stroke="#34D399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-teal-200 mb-3">Key Metrics</h2>
          <div className="grid grid-cols-1 gap-3">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-gray-800/70 p-3 rounded-lg shadow-md border border-teal-900/30">
                <div className="flex items-center space-x-2 mb-1">
                  {stat.icon}
                  <p className="text-xs text-gray-400 font-medium uppercase">{stat.title}</p>
                </div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                {stat.change && <span className={`text-xs font-medium ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%</span>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-teal-200 mb-3">About {coin.name}</h2>
          <div className="bg-gray-800/70 p-4 rounded-lg shadow-md border border-teal-900/30">
            <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoDetailsPage;
