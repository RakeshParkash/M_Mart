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

  const handleTabClick = (tab) => {
    setActiveTab(tab.label);
    if (tab.section) {
      const el = document.getElementById(tab.section);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    if (tab.route) navigate(tab.route);
  };

  return (
    <nav className="w-full bg-white/90 border-b border-gray-200 shadow-sm px-2 py-2 mb-4 rounded-b-xl ">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* Scrollable Tabs */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 md:gap-4 whitespace-nowrap">
            {tabs.map((tab) => (
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

        {/* Search & Auth Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
            className="flex w-full sm:w-auto"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 sm:w-auto px-3 py-1 rounded-l-full border border-[#1976d2] focus:outline-none text-sm text-[#1976d2]"
            />
            <button
              type="submit"
              className="bg-[#1976d2] text-white px-3 py-1 rounded-r-full font-semibold text-sm"
            >
              Search
            </button>
          </form>

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <div className="flex gap-2">
              <button
                className="px-4 py-1 rounded-full bg-[#1976d2] text-white font-semibold text-sm"
                onClick={onLogin}
              >
                Log in
              </button>
              <button
                className="px-4 py-1 rounded-full bg-[#b71c1c] text-white font-semibold text-sm"
                onClick={onSignup}
              >
                Sign up
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-full bg-green-300 text-[#1976d2] font-semibold text-sm hover:bg-green-200"
                onClick={Account}
              >
                My Account
              </button>
              <button
                className="px-3 py-1 rounded-full bg-gray-200 text-[#1976d2] font-semibold text-sm"
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
