import React, { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation } from "react-router-dom";
import SettingsPopover from "../pages/SettingsPage";

const userItems = [
  { icon: "ic:baseline-home", label: "Home", path: "/" },
  { icon: "mdi:food-apple-outline", label: "Categories", path: "/categories" },
  { icon: "mdi:clipboard-list-outline", label: "Orders", path: "/orders" },
  { icon: "mdi:cart-outline", label: "Cart", path: "/cart" },
  { icon: "mdi:cart-outline", label: "Wishlist", path: "/wishlist" },
  { icon: "mdi:account-outline", label: "Account", path: "/MyAccount" },
  { icon: "mdi:card-account-phone-outline", label: "Contact", path: "/contact" },
];

const adminItems = [
  { icon: "mdi:view-dashboard", label: "Dashboard", path: "/admin/main" },
  { icon: "mdi:account-group", label: "Users", path: "/admin/users" },
  { icon: "mdi:box", label: "Products", path: "/admin/products" },
  { icon: "mdi:receipt", label: "Receipts", path: "/admin/receipts" },
  { icon: "mdi:clipboard-list", label: "Lists", path: "/admin/lists" },
  { icon: "mdi:history", label: "Logs", path: "/admin/activity-logs" },
  { icon: "mdi:message", label: "Messages", path: "/admin/messages" }
];

const Sidebar = ({
  theme,
  setTheme,
  isMobile = false,
  isCollapsed = false,
  onClose = () => {},
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const btnRef = useRef(null);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const itemsToRender = isAdminRoute ? adminItems : userItems;

  return (
    <aside
      className={`
        ${isMobile ? "w-full h-full fixed top-0 left-0 z-50" : isCollapsed ? "w-20" : "w-64"}
        ${!isMobile ? "transition-all duration-300 ease-in-out" : ""}
        min-h-screen fixed top-0 left-0 z-40
        bg-black flex flex-col justify-between pb-6
      `}
    >
      <div>
        {/* Logo/Header */}
        <div
          className={`${isMobile ? "p-6" : isCollapsed ? "p-4" : "p-6"} flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center">
            <Icon
              icon="mdi:food-apple"
              className="text-red-500"
              width={30}
              height={30}
            />
            {(!isCollapsed || isMobile) && (
              <Link to="/">
                <span className="ml-2 text-xl font-bold text-white">
                  M. Mart
                </span>
              </Link>
            )}
          </div>
          {isMobile && (
            <button onClick={onClose} className="text-white">
              <Icon icon="mdi:close" width={24} height={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`py-2 ${isCollapsed && !isMobile ? "px-2" : "px-2"}`}>
          {itemsToRender.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                to={item.path}
                key={item.label}
                onClick={isMobile ? onClose : undefined}
                title={isCollapsed && !isMobile ? item.label : ""}
                className={`mb-2 flex items-center ${isCollapsed && !isMobile ? "justify-center" : ""} px-4 py-2 rounded transition-all
                  ${
                    isActive
                      ? "bg-red-700 text-white font-bold border-l-4 border-yellow-400"
                      : "text-white hover:bg-red-700"
                  }
                `}
              >
                <Icon
                  icon={item.icon}
                  className={`${isCollapsed && !isMobile ? "" : "mr-3"} text-xl ${isActive ? "text-yellow-300" : ""}`}
                  width={24}
                  height={24}
                />
                {(!isCollapsed || isMobile) && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* Settings Button */}
          <div
            className={`mt-4 ${isCollapsed && !isMobile ? "px-2" : "px-4"} relative`}
          >
            <button
              ref={btnRef}
              onClick={() => setShowPopover((v) => !v)}
              title={isCollapsed && !isMobile ? "Settings" : ""}
              className={`${isCollapsed && !isMobile ? "w-full px-2 py-2 flex justify-center" : "w-full py-2"} bg-pink-600 hover:bg-red-700 text-white rounded font-semibold transition`}
            >
              {isCollapsed && !isMobile ? (
                <Icon icon="mdi:cog" width={24} height={24} />
              ) : (
                "Settings"
              )}
            </button>
            {showPopover && !isCollapsed && (
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
      {(!isCollapsed || isMobile) && (
        <div className={`${isCollapsed && !isMobile ? "px-2" : "px-5"} mt-4`}>
          <div
            className={`border border-gray-500 rounded-full text-white flex ${isCollapsed && !isMobile ? "justify-center" : "w-2/3"} px-2 py-2 items-center justify-center hover:border-white cursor-pointer`}
          >
            <Icon icon="mynaui:globe" />
            {(!isCollapsed || isMobile) && (
              <div className="mx-2 text-sm font-semibold">English</div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
