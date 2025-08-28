import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { StatCardSkeleton } from '../common/Skeletons';

const StatCard = ({ icon, title, value, change, isLoading }) => {
  if (isLoading) return <StatCardSkeleton />;
  
  const isPositive = change >= 0;
  
  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-900/30 hover:border-teal-700/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-teal-900/20 border border-teal-800/50">
              {icon}
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{title}</p>
              <p className="text-2xl font-bold text-white mt-1">{value || 'N/A'}</p>
            </div>
          </div>
          {change !== undefined && typeof change === 'number' && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isPositive ? 'bg-green-900/30 text-green-300 border border-green-800/50' : 'bg-red-900/30 text-red-300 border border-red-800/50'
            }`}>
              {isPositive ? <ChevronUp size={14} className="mr-1" /> : <ChevronDown size={14} className="mr-1" />}
              <span>{Math.abs(change).toFixed(2)}%</span>
              <span className="text-gray-500 ml-1 text-[10px]">24h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
