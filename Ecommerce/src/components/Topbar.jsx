import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import SettingsPopover from "../pages/SettingsPage";

const navItems = [
  "Home", "Shop", "Categories", "Offers", "Orders", "Cart", "Account", "Support"
];

const Topbar = ({ theme, setTheme, sidebarMode, setSidebarMode }) => {
  const [showPopover, setShowPopover] = useState(false);
  const btnRef = useRef(null);

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-black flex items-center z-50 px-8">
      <div className="flex items-center">
        <Icon icon="mdi:food-apple" className="text-red-500" width={32} height={32} />
        <span className="ml-2 text-xl font-bold text-white">GrocerEase</span>
      </div>
      <nav className="flex-1 flex justify-center gap-8 ml-12">
        {navItems.map(item => (
          <span key={item} className="text-white hover:text-red-400 cursor-pointer">{item}</span>
        ))}
      </nav>
      <div className="ml-auto relative">
        <button
          ref={btnRef}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
          onClick={() => setShowPopover(v => !v)}
        >
          Settings
        </button>
        {showPopover && (
          <SettingsPopover
            theme={theme}
            setTheme={setTheme}
            sidebarMode={sidebarMode}
            setSidebarMode={setSidebarMode}
            onClose={() => setShowPopover(false)}
          />
        )}
      </div>
    </header>
  );
};

export default Topbar;
