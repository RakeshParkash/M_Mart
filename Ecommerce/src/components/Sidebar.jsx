import React from 'react';
import { Icon } from '@iconify/react';

const sidebarItems = [
  { icon: "ic:baseline-home", label: "Home" },
  { icon: "mdi:shopping-outline", label: "Shop" },
  { icon: "mdi:food-apple-outline", label: "Categories" },
  { icon: "mdi:tag-multiple-outline", label: "Offers" },
  { icon: "mdi:clipboard-list-outline", label: "Orders" },
  { icon: "mdi:cart-outline", label: "Cart" },
  { icon: "mdi:account-outline", label: "Account" },
  { icon: "mdi:help-circle-outline", label: "Support" },
];

const Sidebar = ({ onShowSettings }) => (
  <aside className="fixed left-0 top-0 w-64 min-h-screen bg-black flex flex-col justify-between pb-10 z-40">
    <div>
      <div className='logoDiv p-6 flex items-center'>
        <Icon icon="mdi:food-apple" className="text-red-500" width={36} height={36} />
        <span className="ml-2 text-2xl font-bold text-white">GrocerEase</span>
      </div>
      <nav className='py-5'>
        {sidebarItems.map(item => (
          <div key={item.label} className="mb-2 flex items-center text-white px-6 py-2 hover:bg-red-700 rounded cursor-pointer">
            <Icon icon={item.icon} className="mr-3" width={24} height={24} />
            <span>{item.label}</span>
          </div>
        ))}
        <div className="mt-6 px-6">
          <button
            onClick={onShowSettings}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition"
          >
            Settings
          </button>
        </div>
      </nav>
    </div>
    <div className='px-5'>
      <div className='border border-gray-500 rounded-full text-white w-2/3 flex px-2 py-2 items-center justify-center hover:border-white cursor-pointer'>
        <Icon icon="mynaui:globe" />
        <div className='mx-2 text-sm font-semibold'>English</div>
      </div>
    </div>
  </aside>
);

export default Sidebar;
