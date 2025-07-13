import React from 'react';
import { Icon } from '@iconify/react';

const Topbar = ({ onShowSettings }) => (
  <header className="fixed top-0 left-0 w-full h-16 bg-black flex items-center z-50 px-8">
    <div className="flex items-center">
      <Icon icon="mdi:food-apple" className="text-red-500" width={32} height={32} />
      <span className="ml-2 text-xl font-bold text-white">GrocerEase</span>
    </div>
    <nav className="flex-1 flex justify-center gap-8 ml-12">
      <span className="text-white hover:text-red-400 cursor-pointer">Home</span>
      <span className="text-white hover:text-red-400 cursor-pointer">Shop</span>
      <span className="text-white hover:text-red-400 cursor-pointer">Categories</span>
      <span className="text-white hover:text-red-400 cursor-pointer">Offers</span>
      <span className="text-white hover:text-red-400 cursor-pointer">Orders</span>
      <span className="text-white hover:text-red-400 cursor-pointer">Cart</span>
      <span className="text-white hover:text-red-400 cursor-pointer">Account</span>
      <span className="text-white hover:text-red-400 cursor-pointer">Support</span>
    </nav>
    <button
      onClick={onShowSettings}
      className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
    >
      Settings
    </button>
  </header>
);

export default Topbar;
