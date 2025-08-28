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
      default:
        return <HomePage onCoinClick={handleCoinClick} onShowMoreClick={navigateTo} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 min-h-screen font-sans flex">
      {/* Sidebar */}
      <Sidebar 
        activePage={activePage}
        onNavigate={navigateTo}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        {renderPage()}
      </main>
    </div>
  );
}

export default App;