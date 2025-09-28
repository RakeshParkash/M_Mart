import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import SettingsPopover from "../pages/SettingsPage";

const sidebarItems = [
  { icon: "ic:baseline-home", label: "Home", path: "/" },
  { icon: "mdi:food-apple-outline", label: "Categories", path: "/categories" },
  { icon: "mdi:clipboard-list-outline", label: "Orders", path: "/orders" },
  { icon: "mdi:cart-outline", label: "Cart", path: "/cart" },
  { icon: "mdi:account-outline", label: "Account", path: "/MyAccount" },
  // { icon: "mdi:help-circle-outline", label: "Support", path: "/support" },
  { icon: "mdi:card-account-phone-outline", label: "Contact", path: "/contact" },
];

const Sidebar = ({ theme, setTheme, isMobile = false, onClose = () => {} }) => {
  const [showPopover, setShowPopover] = useState(false);
  const btnRef = useRef(null);
  const location = useLocation();

  return (
    <aside
      className={`
        ${isMobile ? "w-full h-full fixed top-0 left-0 z-50" : "w-64 min-h-screen fixed top-0 left-0 z-40"}
        bg-black flex flex-col justify-between pb-6
      `}
    >
      <div>
        {/* Logo/Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Icon icon="mdi:food-apple" className="text-red-500" width={30} height={30} />
            <Link to='/' >
              <span className="ml-2 text-xl font-bold text-white">M. Mart</span>
            </Link>
          </div>
          {isMobile && (
            <button onClick={onClose} className="text-white">
              <Icon icon="mdi:close" width={24} height={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="py-2 px-2">
          {sidebarItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                to={item.path}
                key={item.label}
                onClick={isMobile ? onClose : undefined}
                className={`mb-2 flex items-center px-4 py-2 rounded transition-all
                  ${isActive
                    ? "bg-red-700 text-white font-bold border-l-4 border-yellow-400"
                    : "text-white hover:bg-red-700"}
                `}
              >
                <Icon
                  icon={item.icon}
                  className={`mr-3 text-xl ${isActive ? "text-yellow-300" : ""}`}
                  width={24}
                  height={24}
                />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}

          {/* Settings Button */}
          <div className="mt-4 px-4 relative">
            <button
              ref={btnRef}
              onClick={() => setShowPopover((v) => !v)}
              className="w-full bg-pink-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition"
            >
              Settings
            </button>
            {showPopover && (
              <SettingsPopover
                theme={theme}
                setTheme={setTheme}
                onClose={() => setShowPopover(false)}
              />
            )}
          </div>
        </nav>
      </div>

      {/* Language Selector */}
      <div className="px-5 mt-4">
        <div className="border border-gray-500 rounded-full text-white w-2/3 flex px-2 py-2 items-center justify-center hover:border-white cursor-pointer">
          <Icon icon="mynaui:globe" />
          <div className="mx-2 text-sm font-semibold">English</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
