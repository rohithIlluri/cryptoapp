import React from 'react';
import { Home, TrendingUp, Newspaper, X } from 'lucide-react';

const Sidebar = ({ activePage, onNavigate, isSidebarOpen, onCloseSidebar }) => {
  const NavLink = ({ page, icon, children }) => (
    <button
      onClick={() => onNavigate(page)}
      className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 ${
        activePage === page ? 'bg-teal-900/50 text-teal-200' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );

  return (
    <aside className={`bg-gray-900/90 w-64 fixed top-0 left-0 h-full z-40 transform ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 md:relative md:translate-x-0 border-r border-teal-900/30`}>
      <div className="p-4 border-b border-teal-900/30 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-700 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-teal-200">CryptoPulse</h1>
        </div>
        <button className="md:hidden text-gray-400 hover:text-gray-200" onClick={onCloseSidebar}>
          <X size={20} />
        </button>
      </div>
      <nav className="p-4 space-y-1">
        <NavLink page="home" icon={<Home size={18} className="mr-2" />}>Dashboard</NavLink>
        <NavLink page="cryptocurrencies" icon={<TrendingUp size={18} className="mr-2" />}>Coins</NavLink>
        <NavLink page="news" icon={<Newspaper size={18} className="mr-2" />}>News</NavLink>
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800/70 p-2 rounded-lg border border-teal-900/30 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">API Live</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
