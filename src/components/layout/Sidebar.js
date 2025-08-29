import React from 'react';
import { Home, TrendingUp, Newspaper, X, BarChart3, Settings, User, Bell, Zap } from 'lucide-react';

const Sidebar = ({ activePage, onNavigate, isSidebarOpen, onCloseSidebar }) => {
  const NavLink = ({ page, icon, children, badge }) => (
    <button
      onClick={() => onNavigate(page)}
      className={`group relative w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        activePage === page 
          ? 'bg-black text-white shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-black'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg transition-colors ${
          activePage === page 
            ? 'bg-white/20 text-white' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-black'
        }`}>
          {icon}
        </div>
        <span className="flex-1">{children}</span>
        {badge && (
          <span className="px-2 py-1 text-xs font-bold bg-black text-white rounded-full">
            {badge}
          </span>
        )}
      </div>
      
      {/* Active indicator */}
      {activePage === page && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
      )}
    </button>
  );

  const QuickAction = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="p-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-black transition-colors w-full"
    >
      <div className="text-center">
        <div className="mx-auto mb-2 p-2 rounded-lg bg-white group-hover:bg-gray-50 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </button>
  );

  return (
    <>
      {/* Mobile Overlay - Only on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={onCloseSidebar} 
        />
      )}

      {/* Sidebar - Fixed positioning on mobile, relative on desktop */}
      <aside className={`fixed md:relative top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-72 bg-white border-r border-gray-200 shadow-sm flex-shrink-0`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">
                  CryptoPulse
                </h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
            <button 
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black transition-colors" 
              onClick={onCloseSidebar}
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-green-700">Live Market Data</span>
            <div className="ml-auto text-xs text-green-600">API Connected</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Navigation</h3>
            <NavLink page="home" icon={<Home size={18} />}>Dashboard</NavLink>
            <NavLink page="cryptocurrencies" icon={<TrendingUp size={18} />}>Cryptocurrencies</NavLink>
            <NavLink page="news" icon={<Newspaper size={18} />} badge="NEW">News</NavLink>
          </div>
          
          <div className="space-y-2 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Analytics</h3>
            <NavLink page="charts" icon={<BarChart3 size={18} />}>Charts</NavLink>
            <NavLink page="portfolio" icon={<User size={18} />}>Portfolio</NavLink>
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction 
              icon={<Bell size={14} />} 
              label="Alerts" 
              onClick={() => {}} 
            />
            <QuickAction 
              icon={<Settings size={14} />} 
              label="Settings" 
              onClick={() => {}} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Features Active</span>
            </div>
            <p className="text-xs text-gray-400">v2.0.0 • Clean UI</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
