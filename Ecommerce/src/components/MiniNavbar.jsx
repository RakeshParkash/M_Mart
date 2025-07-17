import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MiniNavbar({
  isAuthenticated,
  onLogin,
  onSignup,
  onLogout,
  searchValue,
  setSearchValue,
  onSearch,
  Account
}) {
  const [activeTab, setActiveTab] = useState("Home");
  const navigate = useNavigate();

  // Define tab data: label and id/route
  const tabs = [
    { label: "Perishables", section: "perishables" },
    { label: "Snacks", section: "snacks" },
    { label: "Beverages", section: "beverages" },
    { label: "Grains", section: "grains" },
    { label: "Bakery", section: "bakery" },
    { label: "Dairy", section: "dairy" },
    { label: "Offers", section: "offers" },
    { label: "Contact", section: "contact" },
  ];

  // Handles section scrolling OR route navigation
  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    if (tab.section) {
      const el = document.getElementById(tab.section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    if (tab.route) {
      navigate(tab.route);
    }
  };

  return (
    <nav className="w-full bg-white/90 border-b border-gray-200 shadow-sm px-2 py-1 mb-4 rounded-b-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        {/* Section Tabs: Horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 md:gap-4 whitespace-nowrap">
            {tabs.map(tab => (
              <button
                key={tab.label}
                className={`px-3 py-1 rounded-full font-semibold transition text-sm md:text-base ${
                  activeTab === tab.label
                    ? "bg-[#1976d2] text-white"
                    : "text-[#1976d2] hover:bg-blue-50"
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Actions: Search, Auth Buttons, etc */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-2 md:mt-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              onSearch();
            }}
            className="flex items-center w-full sm:w-auto"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="px-3 py-1 rounded-l-full border border-[#1976d2] focus:outline-none text-sm w-full sm:w-fit"
              style={{ color: "#1976d2" }}
            />
            <button
              type="submit"
              className="bg-[#1976d2] text-white px-3 py-1 rounded-r-full font-semibold text-sm"
            >
              Search
            </button>
          </form>

          {!isAuthenticated ? (
            <div className="flex gap-1 sm:gap-2 mt-1 sm:mt-0">
              <button
                className="px-4 py-1 rounded-full bg-[#1976d2] text-white font-semibold text-sm"
                onClick={onLogin}
              >
                Log in
              </button>
              <button
                className="px-4 py-1 rounded-full bg-[#b71c1c] text-white font-semibold border border-[#1976d2] text-sm"
                onClick={onSignup}
              >
                Sign up
              </button>
            </div>
          ) : (
            <div id="MyAccount" className="flex items-center gap-2 mt-1 sm:mt-0">
              <button  className="font-semibold text-[#1976d2] text-sm rounded-full cursor-pointer"
                onClick={Account}
              >My Account
              </button>
              <button
                className="px-3 py-1 rounded-full bg-gray-200 text-[#1976d2] font-semibold text-sm cursor-pointer"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
