import React, { useMemo, useState, useEffect } from "react";
import MiniNavbar from "./MiniNavbar";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FALLBACK_IMAGE, getSafeImageUrl } from "../utils/image";
import { clearAuthToken, getAuthToken } from "../utils/token";

// Utility to get colors
const getColors = (accentColor) => {
  switch (accentColor) {
    case "blue":
      return {
        heading: "#1a237e",
        accent: "#1565c0",
        border: "#1976d2",
        text: "#222",
      };
    case "yellow":
      return {
        heading: "#b28704",
        accent: "#fbc02d",
        border: "#fbc02d",
        text: "#333",
      };
    case "green":
      return {
        heading: "#1b5e20",
        accent: "#388e3c",
        border: "#388e3c",
        text: "#222",
      };
    case "purple":
      return {
        heading: "#4a148c",
        accent: "#8e24aa",
        border: "#8e24aa",
        text: "#222",
      };
    case "red":
      return {
        heading: "#b71c1c",
        accent: "#d32f2f",
        border: "#d32f2f",
        text: "#222",
      };
    case "gray":
      return {
        heading: "#424242",
        accent: "#616161",
        border: "#757575",
        text: "#212121",
      };
    default:
      return {
        heading: "#b71c1c",
        accent: "#d32f2f",
        border: "#d32f2f",
        text: "#222",
      };
  }
};

const CategoryTiles = ({ categories }) => (
  <section className="max-w-6xl mx-auto px-4 pb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-extrabold text-[#1976d2]">
        Shop by Category
      </h2>
      <button
        className="text-sm font-semibold text-[#1976d2] hover:underline"
        onClick={() => window.location.assign("/categories")}
      >
        View all
      </button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => window.location.assign("/categories")}
          className="bg-white border border-blue-100 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition"
        >
          <div className="text-lg font-bold text-blue-900">{cat.name}</div>
          <div className="text-sm text-gray-500">{cat.count} items</div>
        </button>
      ))}
    </div>
  </section>
);

const ContactSection = ({ id = "contact" }) => (
  <section id={id} className="max-w-6xl mx-auto px-4 py-16 text-black rounded">
    <h2
      className="text-2xl font-extrabold mb-8 border-l-4 pl-4"
      style={{ color: "#4a148c", borderColor: "#8e24aa" }}
    >
      Contact Us
    </h2>
    <div className="bg-white rounded-xl shadow p-6 md:p-12 flex flex-col items-center gap-4">
      <p>
        Have questions? We’d love to hear from you. Reach us at{" "}
        <a
          href="mailto:support@grocerease.com"
          className="text-[#1976d2] underline"
        >
          support@example.com
        </a>
      </p>
      <p>
        Or call:{" "}
        <span className="font-bold text-[#1976d2]">+91 9876543210</span>
      </p>
    </div>
  </section>
);

// "Home" banner/hero
const HeroBanner = ({ stats }) => (
  <section
    id="home"
    className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-12 px-4 mb-8 scroll-mt-20"
  >
    {/* Left: Headline */}
    <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
      <h1
        className="text-4xl md:text-5xl font-extrabold mb-4"
        style={{ color: "#1976d2" }}
      >
        Fresh Perishables, Delivered Daily
      </h1>
      <p className="text-lg mb-6 text-gray-700">
        Discover the best dairy, bakery, and plant-based perishables for your
        healthy vegetarian lifestyle.
      </p>
      {stats && (
        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            {stats.totalProducts} products live
          </span>
          <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
            {stats.activeCategories} categories active
          </span>
          {stats.topCategory && (
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
              Top pick: {stats.topCategory}
            </span>
          )}
        </div>
      )}
      <a href="#perishables">
        <button className="bg-[#1976d2] hover:bg-[#b71c1c] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md transition cursor-pointer">
          Shop Bestsellers
        </button>
      </a>
    </div>
    <div className="flex-1 bg-white/70 rounded-2xl shadow p-6 border border-blue-100">
      <div className="text-sm uppercase tracking-[0.3em] text-[#1976d2] font-semibold mb-3">
        Discover
      </div>
      <h3 className="text-2xl font-extrabold text-[#0f172a] mb-3">
        Browse curated categories
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Explore everything in one place. Click any category to view items and
        details.
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          "Perishables",
          "Snacks",
          "Beverages",
          "Grains",
          "Bakery",
          "Dairy",
          "Offers",
        ].map((label) => (
          <span
            key={label}
            className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(!!getAuthToken());
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");
  const handleAccount = () => navigate("/MyAccount");
  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  // Placeholder: implement as you wish.
  const handleSearch = () => alert("search");

  const [allProducts, setAllProducts] = useState({
    Perishables: [],
    Snacks: [],
    Beverages: [],
    Grains: [],
    Bakery: [],
    Dairy: [],
    Offers: [],
    Others: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products/get")
      .then(({ data }) => {
        setAllProducts(
          data || {
            Perishables: [],
            Snacks: [],
            Beverages: [],
            Grains: [],
            Bakery: [],
            Dairy: [],
            Offers: [],
            Others: [],
          },
        );
      })
      .catch((err) => {
        console.error("Failed to fetch products", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const entries = Object.entries(allProducts || {}).filter(([, items]) =>
      Array.isArray(items),
    );
    const totals = entries.map(([category, items]) => ({
      category,
      count: items.length,
    }));
    const totalProducts = totals.reduce((sum, item) => sum + item.count, 0);
    const activeCategories = totals.filter((item) => item.count > 0).length;
    const topCategory =
      totals.sort((a, b) => b.count - a.count)[0]?.category || null;
    return { totalProducts, activeCategories, topCategory };
  }, [allProducts]);

  const categoryTiles = useMemo(
    () =>
      Object.entries(allProducts || {})
        .filter(([, items]) => Array.isArray(items) && items.length)
        .map(([name, items]) => ({ name, count: items.length }))
        .slice(0, 8),
    [allProducts],
  );

  return (
    <div className=" relative min-h-screen bg-gradient-to-br from-[#fff3e0] via-white to-[#e3f2fd]">
      {/* Navbar */}
      <div className="fixed left-0 right-0 lg:left-64 lg:top-10 sm:top-0 z-40 bg-white shadow-md">
        <MiniNavbar
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onLogout={handleLogout}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onSearch={handleSearch}
          Account={handleAccount}
        />
      </div>

      {/* Hero/Home Section */}
      <div className="pt-20">
        <HeroBanner stats={stats} />
      </div>

      <CategoryTiles categories={categoryTiles} />

      {loading ? (
        <div className="text-center text-lg py-12">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">
          Failed to load products. Please try again.
        </div>
      ) : (
        <>
          <ContactSection id="contact" />
        </>
      )}
    </div>
  );
}
