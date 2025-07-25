import React, { useState, useEffect } from "react";
import MiniNavbar from './MiniNavbar';
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

// Utility to get colors
const getColors = (accentColor) => {
  switch (accentColor) {
    case "blue": return { heading: "#1a237e", accent: "#1565c0", border: "#1976d2", text: "#222" };
    case "yellow": return { heading: "#b28704", accent: "#fbc02d", border: "#fbc02d", text: "#333" };
    case "green": return { heading: "#1b5e20", accent: "#388e3c", border: "#388e3c", text: "#222" };
    case "purple": return { heading: "#4a148c", accent: "#8e24aa", border: "#8e24aa", text: "#222" };
    case "red": return { heading: "#b71c1c", accent: "#d32f2f", border: "#d32f2f", text: "#222" };
    case "gray":
    return {
    heading: "#424242",   // Dark gray
    accent: "#616161",    // Mid gray
    border: "#757575",    // Light border gray
    text: "#212121"       // Very dark for contrast
  };
  default:
    return { heading: "#b71c1c", accent: "#d32f2f", border: "#d32f2f", text: "#222" };
  }
};




// Generalized Section
const ProductSection = ({ id, title, products, accentColor = "red" }) => {
  const { heading, accent, border, text } = getColors(accentColor);
  return (
    <section id={id} className="rounded-xl shadow-lg p-4 flex flex-col items-center border-t-4 transition hover:scale-105 animate-fade-in " >
      <h2 className="text-2xl font-extrabold mb-8 border-l-4 pl-4 rounded-full" style={{ color: heading, borderColor: border }}>{title}</h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
        {products.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl shadow-lg p-4 flex flex-col items-center border-t-4 transition hover:scale-105"
            style={{ background: "#fff", borderColor: border }}
          >
            <img src={item.img} alt={item.name} className="w-24 h-24 object-cover rounded-full border-4 mb-4" style={{ borderColor: accent }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: heading }}>{item.name}</h3>
            <p className="text-sm mb-1 text-center" style={{ color: text }}>{item.desc}</p>
            {item.price && <p className="text-md font-semibold mb-3" style={{ color: accent }}>{item.price}</p>}
            {item.cta && (
              <button className="mt-auto px-4 py-1 rounded-full font-medium transition hover:brightness-110 cursor-pointer"
                style={{ background: accent, color: "#fff", boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)" }}>
                {item.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};



const ContactSection = ({ id = "contact" } ) => (
  <section id={id} className="max-w-6xl mx-auto px-4 py-16 text-black rounded">
    <h2 className="text-2xl font-extrabold mb-8 border-l-4 pl-4" style={{ color: "#4a148c", borderColor: "#8e24aa" }}>Contact Us</h2>
    <div className="bg-white rounded-xl shadow p-6 md:p-12 flex flex-col items-center gap-4">
      <p>Have questions? We’d love to hear from you. Reach us at <a href="mailto:support@grocerease.com" className="text-[#1976d2] underline">support@example.com</a></p>
      <p>Or call: <span className="font-bold text-[#1976d2]">+91 to be there</span></p>
    </div>
  </section>
);

// "Home" banner/hero
const HeroBanner = ({ perishables }) => (
  <section id="home" className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-12 px-4 mb-8 scroll-mt-20">
    {/* Left: Headline */}
    <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "#1976d2" }}>Fresh Perishables, Delivered Daily</h1>
      <p className="text-lg mb-6" style={{ color: "black" }}>
        Discover the best dairy, bakery, and plant-based perishables for your healthy vegetarian lifestyle.
      </p>
      <a href="#perishables">
        <button className="bg-[#1976d2] hover:bg-[#b71c1c] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md transition cursor-pointer">
          Shop Bestsellers
        </button>
      </a>
    </div>
    {/* Right: Perishables Showcase */}
    <div className="flex-1 grid grid-cols-2 gap-4">
      {perishables.map((item, idx) => (
        <div key={idx}
          className="bg-white rounded-xl shadow hover:shadow-lg p-3 flex flex-col items-center transition">
          <img src={item.img} alt={item.name} className="w-24 h-24 object-cover rounded-full border-2 border-[#1976d2] mb-2" />
          <div className="font-bold" style={{ color: "#1976d2" }}>{item.name}</div>
          <div className="text-xs text-center" style={{ color: "#b71c1c" }}>{item.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!cookies.token);

  useEffect(() => {
    setIsAuthenticated(!!cookies.token);
  }, [cookies.token]);

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");
  const handleAccount = () => navigate("/Myaccount");
  const handleLogout = () => removeCookie("token", { path: "/" });

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
    Others: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API}/products/get`)
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => {
        console.error("Failed to fetch products", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fff3e0] via-white to-[#e3f2fd] rounded-full">
      
      <div className="
        fixed top-0 
        left-[56px] md:left-[260px] 
        w-[calc(100%-56px)] md:w-[calc(100%-260px)] 
        z-50 bg-white shadow-md
      ">


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
      <HeroBanner perishables={allProducts.Perishables.slice(0, 4)} />

      {loading ? (
          <div className="text-center text-lg py-12">Loading products...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">Failed to load products. Please try again.</div>
        ) : (
          <>
             {/* All other product sections, ids must match MiniNavbar! */}
      <ProductSection id="perishables" title="Perishables" products={allProducts.Perishables || []} accentColor="red" />
      <ProductSection id="snacks" title="Snacks" products={allProducts.Snacks || []} accentColor="yellow" />
      <ProductSection id="beverages" title="Beverages" products={allProducts.Beverages || []} accentColor="blue" />
      <ProductSection id="grains" title="Grains & Staples" products={allProducts.Grains || []} accentColor="green" />
      <ProductSection id="bakery" title="Bakery" products={allProducts.Bakery || []} accentColor="purple" />
      <ProductSection id="dairy" title="Dairy" products={allProducts.Dairy || []} accentColor="red" />
      <ProductSection id="offers" title="Offers" products={allProducts.Offers || []} accentColor="blue" />
      <ProductSection id="others" title="Others" products={allProducts.Others || []} accentColor="gray" />



      <ContactSection id="contact" />
          </>
        )}

     

      
    </div>
  );
}
