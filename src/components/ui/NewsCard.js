import React from 'react';
import { ArrowRight } from 'lucide-react';

const NewsCard = ({ article }) => (
  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-900/30 hover:border-teal-700/50">
    <div className="relative overflow-hidden">
      <img
        src={article.imageurl || 'https://placehold.co/600x400/1a1a1a/6b7280?text=Crypto+News'}
        alt={article.title}
        className="w-full h-36 object-cover transition-transform duration-300 hover:scale-105"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1a1a1a/6b7280?text=Crypto+News'; }}
      />
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2">{article.title}</h3>
      <p className="text-gray-400 text-sm flex-grow line-clamp-3 mb-3">{article.body}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(article.published_on * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 font-medium flex items-center">
          Read More <ArrowRight size={14} className="ml-1" />
        </a>
      </div>
    </div>
  </div>
);

export default NewsCard;
