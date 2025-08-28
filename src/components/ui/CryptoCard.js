import React from 'react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const CryptoCard = ({ coin, onCoinClick }) => (
  <div
    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-900/30 hover:border-teal-700/50 cursor-pointer"
    onClick={() => onCoinClick(coin.id)}
  >
    <div className="flex items-center space-x-3 mb-3">
      <img
        src={coin.image || 'https://placehold.co/40x40'}
        alt={coin.name || 'Crypto'}
        className="w-10 h-10 rounded-lg flex-shrink-0"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40'; }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm truncate">{coin.name || 'Unknown'}</h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{coin.symbol || 'N/A'}</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-xs">Price</span>
        <span className="font-medium text-white text-sm">{formatCurrency(coin.current_price)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-xs">Market Cap</span>
        <span className="font-medium text-gray-300 text-xs">{formatNumber(coin.market_cap)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-xs">24h Change</span>
        <span
          className={`font-semibold px-2 py-1 rounded text-xs ${
            coin.price_change_percentage_24h >= 0 
              ? 'bg-green-900/30 text-green-300 border border-green-800/50' 
              : 'bg-red-900/30 text-red-300 border border-red-800/50'
          }`}
        >
          {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
        </span>
      </div>
    </div>
  </div>
);

export default CryptoCard;
