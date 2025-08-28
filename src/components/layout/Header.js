import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ onOpenSidebar }) => (
  <div className="flex justify-between items-center mb-6 md:hidden">
    <h1 className="text-xl font-bold text-teal-200">CryptoPulse</h1>
    <button onClick={onOpenSidebar} className="text-gray-400 hover:text-gray-200">
      <Menu size={24} />
    </button>
  </div>
);

export default Header;
