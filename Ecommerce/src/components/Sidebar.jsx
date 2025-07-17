import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import SettingsPopover from "../pages/SettingsPage";

const sidebarItems = [
  { icon: "ic:baseline-home", label: "Home", path: "/" },
  { icon: "mdi:shopping-outline", label: "Shop", path: "/shop" },
  { icon: "mdi:food-apple-outline", label: "Categories", path: "/categories" },
  { icon: "mdi:tag-multiple-outline", label: "Offers", path: "/offers" },
  { icon: "mdi:clipboard-list-outline", label: "Orders", path: "/orders" },
  { icon: "mdi:cart-outline", label: "Cart", path: "/cart" },
  { icon: "mdi:account-outline", label: "Account", path: "/account" },
  { icon: "mdi:help-circle-outline", label: "Support", path: "/support" }
];

const Sidebar = ({ theme, setTheme, sidebarMode, setSidebarMode }) => {
  const [showPopover, setShowPopover] = useState(false);
  const btnRef = useRef(null);
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 w-64 min-h-screen bg-black flex flex-col justify-between pb-10 z-40">
      <div>
        <div className="logoDiv p-6 flex items-center">
          <Icon icon="mdi:food-apple" className="text-red-500" width={36} height={36} />
          <span className="ml-2 text-2xl font-bold text-white">M. Mart</span>
        </div>
        <nav className="py-5">
          {sidebarItems.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                to={item.path}
                key={item.label}
                className={`mb-2 flex items-center px-6 py-2 rounded cursor-pointer transition-all group
                  ${isActive
                    ? "bg-red-700 text-white font-bold shadow border-l-4 border-yellow-400"
                    : "text-white hover:bg-red-700"}
                `}
              >
                <Icon icon={item.icon}
                  className={`mr-3 text-xl transition ${isActive ? "text-yellow-300" : ""}`}
                  width={24}
                  height={24}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}


          <div className="mt-6 px-6 relative">
            <button
              ref={btnRef}
              onClick={() => setShowPopover(v => !v)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition"
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
        </nav>
      </div>
      <div className="px-5">
        <div className="border border-gray-500 rounded-full text-white w-2/3 flex px-2 py-2 items-center justify-center hover:border-white cursor-pointer">
          <Icon icon="mynaui:globe" />
          <div className="mx-2 text-sm font-semibold">English</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
