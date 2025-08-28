import React, { useState, useEffect } from 'react';
import { fetchNews } from '../../services/api';
import NewsCard from '../ui/NewsCard';
import { NewsCardSkeleton } from '../common/Skeletons';
import ErrorDisplay from '../common/ErrorDisplay';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchNews();
        setNews(data?.Data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNewsData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 py-6 bg-gradient-to-b from-teal-900/50 to-gray-900/80 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-teal-200 tracking-tight">Crypto News</h1>
        <p className="text-lg text-gray-300 max-w-lg mx-auto">Stay informed with the latest crypto updates</p>
      </div>

      {error ? (
        <ErrorDisplay message={error} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />) : news.map((article) => <NewsCard key={article.id} article={article} />)}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
