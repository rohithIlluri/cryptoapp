import React from 'react';

export const StatCardSkeleton = () => (
  <div className="bg-gray-800/70 p-5 rounded-lg animate-pulse shadow-lg">
    <div className="flex items-center space-x-3">
      <div className="bg-gray-700/50 rounded-full w-10 h-10"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700/50 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-700/50 rounded w-28"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-700/50 rounded w-16 mt-3"></div>
  </div>
);

export const CryptoCardSkeleton = () => (
  <div className="bg-gray-800/70 p-4 rounded-lg animate-pulse shadow-lg">
    <div className="flex items-center space-x-3 mb-3">
      <div className="bg-gray-700/50 rounded-full w-10 h-10"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700/50 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-700/50 rounded w-16"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-700/50 rounded w-full"></div>
      <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
    </div>
  </div>
);

export const NewsCardSkeleton = () => (
  <div className="bg-gray-800/70 rounded-lg overflow-hidden flex flex-col animate-pulse shadow-lg">
    <div className="w-full h-32 bg-gray-700/50"></div>
    <div className="p-4 flex flex-col flex-grow">
      <div className="h-5 bg-gray-700/50 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-3"></div>
      <div className="h-4 bg-gray-700/50 rounded w-1/3 mt-auto"></div>
    </div>
  </div>
);

export const CryptoDetailsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="text-center border-b border-gray-700/50 pb-8">
      <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gray-700/50"></div>
      <div className="h-12 bg-gray-700/50 rounded w-1/2 mx-auto mb-3"></div>
      <div className="h-6 bg-gray-700/50 rounded w-3/4 mx-auto"></div>
    </div>
    <div>
      <div className="h-12 bg-gray-700/50 rounded-lg w-72 mx-auto mb-8"></div>
      <div className="h-96 bg-gray-800/50 rounded-lg w-full"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="h-8 bg-gray-700/50 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-800/50 rounded-lg"></div>)}
      </div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-700/50 rounded w-1/2"></div>
        <div className="h-4 bg-gray-700/50 rounded w-full"></div>
        <div className="h-4 bg-gray-700/50 rounded w-full"></div>
        <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);
