import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import HomePage from './components/pages/HomePage';
import CryptocurrenciesPage from './components/pages/CryptocurrenciesPage';
import NewsPage from './components/pages/NewsPage';
import CryptoDetailsPage from './components/pages/CryptoDetailsPage';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigateTo = (page) => {
    setActivePage(page);
    setSelectedCoinId(null);
    setIsSidebarOpen(false);
  };

  const handleCoinClick = (coinId) => {
    setSelectedCoinId(coinId);
    setActivePage('crypto-details');
  };

  const renderPage = () => {
    if (activePage === 'crypto-details' && selectedCoinId) {
      return <CryptoDetailsPage coinId={selectedCoinId} />;
    }
    
    switch (activePage) {
      case 'home':
        return <HomePage onCoinClick={handleCoinClick} onShowMoreClick={navigateTo} />;
      case 'cryptocurrencies':
        return <CryptocurrenciesPage onCoinClick={handleCoinClick} />;
      case 'news':
        return <NewsPage />;
      case 'charts':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3 py-8 bg-gray-100 rounded-lg border border-gray-200">
              <h1 className="text-3xl font-bold text-black tracking-tight">Charts & Analytics</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Advanced cryptocurrency charts and market analysis tools</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500 text-lg">Charts and analytics features coming soon...</p>
            </div>
          </div>
        );
      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3 py-8 bg-gray-100 rounded-lg border border-gray-200">
              <h1 className="text-3xl font-bold text-black tracking-tight">Portfolio Management</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Track your cryptocurrency investments and performance</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500 text-lg">Portfolio management features coming soon...</p>
            </div>
          </div>
        );
      default:
        return <HomePage onCoinClick={handleCoinClick} onShowMoreClick={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <div className="flex">
        {/* Sidebar - Fixed width, no overlay */}
        <Sidebar 
          activePage={activePage}
          onNavigate={navigateTo}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />

        {/* Main Content - Takes remaining width */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-white">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;