// import React, { useState } from "react";

// // Generalized Section component for any product type
// const ProductSection = ({ title, products, accentColor = "red" }) => (
//   <section className="max-w-6xl mx-auto px-4 py-8">
//     <h2
//       className="text-2xl font-semibold mb-8 border-l-4 pl-4"
//       style={{
//         color: "var(--heading-accent)",
//         borderColor: "var(--heading-accent)"
//       }}
//     >
//       {title}
//     </h2>
//     <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//       {products.map((item, idx) => (
//         <div
//           key={idx}
//           className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border-t-4 border-[var(--heading-accent)] hover:border-[var(--bg-main)] transition animate-fade-in"
//         >
//           <img
//             src={item.img}
//             alt={item.name}
//             className="w-24 h-24 object-cover rounded-full border-4 border-[var(--heading-accent)] mb-4"
//           />
//           <h3 className="text-lg font-bold mb-2" style={{ color: "var(--heading-accent)" }}>
//             {item.name}
//           </h3>
//           <p className="text-sm mb-1 text-center" style={{ color: "var(--bg-main)" }}>
//             {item.desc}
//           </p>
//           {item.price && (
//             <p className="text-md font-semibold mb-3" style={{ color: "var(--heading-accent)" }}>
//               {item.price}
//             </p>
//           )}
//           {item.cta && (
//             <button className="mt-auto px-4 py-1 bg-[var(--heading-accent)] hover:bg-[var(--bg-main)] text-white rounded-full font-medium transition">
//               {item.cta}
//             </button>
//           )}
//         </div>
//       ))}
//     </div>
//   </section>
// );

// // Mini-navbar (not fixed, placed after sidebar)
// const MiniNavbar = ({
//   isAuthenticated,
//   onLogin,
//   onSignup,
//   onLogout,
//   searchValue,
//   setSearchValue,
//   onSearch
// }) => {
//   const [activeTab, setActiveTab] = useState("Home");
//   const tabs = [
//     "Home",
//     "Perishables",
//     "Snacks",
//     "Beverages",
//     "Grains",
//     "Bakery",
//     "Dairy",
//     "Offers",
//     "Contact"
//   ];

//   return (
//     <nav className="w-full bg-white/90 border-b border-gray-200 shadow-sm flex flex-wrap md:flex-nowrap items-center px-4 py-2 justify-between mb-4 rounded-b-xl">
//       <div className="flex flex-wrap gap-2 md:gap-4">
//         {tabs.map(tab => (
//           <button
//             key={tab}
//             className={`px-3 py-1 rounded-full font-semibold transition ${
//               activeTab === tab
//                 ? "bg-[var(--heading-accent)] text-white"
//                 : "text-[var(--heading-accent)] hover:bg-[var(--bg-main)]/10"
//             }`}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>
//       <div className="flex items-center gap-2 mt-2 md:mt-0">
//         {/* Search bar */}
//         <form
//           onSubmit={e => {
//             e.preventDefault();
//             onSearch();
//           }}
//           className="flex items-center"
//         >
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchValue}
//             onChange={e => setSearchValue(e.target.value)}
//             className="px-3 py-1 rounded-l-full border border-[var(--heading-accent)] focus:outline-none"
//             style={{ color: "var(--heading-accent)" }}
//           />
//           <button
//             type="submit"
//             className="bg-[var(--heading-accent)] text-white px-3 py-1 rounded-r-full font-semibold"
//           >
//             Search
//           </button>
//         </form>
//         {/* Auth */}
//         {!isAuthenticated ? (
//           <>
//             <button
//               className="px-4 py-1 rounded-full bg-[var(--heading-accent)] text-white font-semibold ml-2"
//               onClick={onLogin}
//             >
//               Log in
//             </button>
//             <button
//               className="px-4 py-1 rounded-full bg-[var(--bg-main)] text-white font-semibold border border-[var(--heading-accent)] ml-2"
//               onClick={onSignup}
//             >
//               Sign up
//             </button>
//           </>
//         ) : (
//           <div className="flex items-center gap-3 ml-2">
//             <span className="font-semibold text-[var(--heading-accent)]">My Account</span>
//             <button
//               className="px-3 py-1 rounded-full bg-gray-200 text-[var(--heading-accent)] font-semibold"
//               onClick={onLogout}
//             >
//               Logout
//             </button>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// // Example mock data for each section
// const perishables = [
//   {
//     name: "Fresh Cow Milk",
//     desc: "Farm-fresh, pure cow milk delivered every morning.",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
//     price: "₹60/litre",
//     cta: "Add to Cart"
//   },
//   {
//     name: "Homemade Paneer",
//     desc: "Soft, creamy paneer made from pure milk.",
//     img: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
//     price: "₹280/kg",
//     cta: "Add to Cart"
//   },
//   // ...more
// ];
// const snacks = [
//   {
//     name: "Roasted Almonds",
//     desc: "Crunchy, protein-rich roasted almonds.",
//     img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80",
//     price: "₹650/kg",
//     cta: "Add to Cart"
//   },
//   {
//     name: "Masala Khakhra",
//     desc: "Healthy, baked Gujarati snack.",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
//     price: "₹80/pack",
//     cta: "Add to Cart"
//   },
//   // ...more
// ];
// const beverages = [
//   {
//     name: "Almond Milk",
//     desc: "Chilled, vegan almond milk for lactose-free nutrition.",
//     img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80",
//     price: "₹120/litre",
//     cta: "Add to Cart"
//   },
//   {
//     name: "Greek Yogurt Smoothie",
//     desc: "Probiotic-rich, natural smoothie.",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
//     price: "₹90/bottle",
//     cta: "Add to Cart"
//   },
//   // ...more
// ];
// const grains = [
//   {
//     name: "Basmati Rice",
//     desc: "Aromatic long-grain rice, perfect for biryani.",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
//     price: "₹120/kg",
//     cta: "Add to Cart"
//   },
//   {
//     name: "Whole Wheat Flour",
//     desc: "Stone-ground, high-fiber wheat flour.",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
//     price: "₹45/kg",
//     cta: "Add to Cart"
//   },
//   // ...more
// ];

// export default function HeroSection() {
//   // Simulate authentication state
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [searchValue, setSearchValue] = useState("");

//   // Demo handlers
//   const handleLogin = () => setIsAuthenticated(true);
//   const handleSignup = () => setIsAuthenticated(true);
//   const handleLogout = () => setIsAuthenticated(false);
//   const handleSearch = () => {
//     alert(`Searching for: ${searchValue}`);
//   };

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
//       {/* Mini-navbar (after sidebar, not fixed to top) */}
//       <div className="ml-0 md:ml-0">
//         <MiniNavbar
//           isAuthenticated={isAuthenticated}
//           onLogin={handleLogin}
//           onSignup={handleSignup}
//           onLogout={handleLogout}
//           searchValue={searchValue}
//           setSearchValue={setSearchValue}
//           onSearch={handleSearch}
//         />
//       </div>
//       {/* Hero Banner */}
//       <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-12 px-4 mb-8">
//         {/* Left: Headline */}
//         <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
//           <h1
//             className="text-4xl md:text-5xl font-extrabold mb-4"
//             style={{ color: "var(--heading-color)" }}
//           >
//             Fresh Perishables, Delivered Daily
//           </h1>
//           <p
//             className="text-lg mb-6"
//             style={{ color: "var(--heading-accent)" }}
//           >
//             Discover the best dairy, bakery, and plant-based perishables for your healthy vegetarian lifestyle.
//           </p>
//           <button className="bg-[var(--heading-accent)] hover:bg-[var(--bg-main)] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md transition">
//             Shop Bestsellers
//           </button>
//         </div>
//         {/* Right: Perishables Showcase */}
//         <div className="flex-1 grid grid-cols-2 gap-4">
//           {perishables.map((item, idx) => (
//             <div
//               key={idx}
//               className="bg-white rounded-xl shadow hover:shadow-lg p-3 flex flex-col items-center transition"
//             >
//               <img
//                 src={item.img}
//                 alt={item.name}
//                 className="w-24 h-24 object-cover rounded-full border-2 border-[var(--heading-accent)] mb-2"
//               />
//               <div className="font-bold" style={{ color: "var(--heading-accent)" }}>
//                 {item.name}
//               </div>
//               <div className="text-xs text-center" style={{ color: "var(--bg-main)" }}>
//                 {item.desc}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//       {/* Other generalized sections */}
//       <ProductSection title="Snacks" products={snacks} accentColor="yellow" />
//       <ProductSection title="Beverages" products={beverages} accentColor="blue" />
//       <ProductSection title="Grains & Staples" products={grains} accentColor="green" />
//       {/* Add more sections as needed */}
//       <footer className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-500 text-sm mt-12">
//         &copy; {new Date().getFullYear()} GrocerEase. All rights reserved.
//       </footer>
//     </div>
//   );
// }


import React, { useState } from "react";

// Utility: get headline and accent colors based on theme
const getColors = (accentColor) => {
  switch (accentColor) {
    case "blue":
      return {
        heading: "#1a237e", // deep blue
        accent: "#1565c0",  // strong blue
        border: "#1976d2",
        text: "#222",
      };
    case "yellow":
      return {
        heading: "#b28704", // dark gold
        accent: "#fbc02d",  // strong yellow
        border: "#fbc02d",
        text: "#333",
      };
    case "green":
      return {
        heading: "#1b5e20", // deep green
        accent: "#388e3c",  // strong green
        border: "#388e3c",
        text: "#222",
      };
    case "purple":
      return {
        heading: "#4a148c", // deep purple
        accent: "#8e24aa",  // strong purple
        border: "#8e24aa",
        text: "#222",
      };
    case "red":
    default:
      return {
        heading: "#b71c1c", // deep red
        accent: "#d32f2f",  // strong red
        border: "#d32f2f",
        text: "#222",
      };
  }
};

const ProductSection = ({ title, products, accentColor = "red" }) => {
  const { heading, accent, border, text } = getColors(accentColor);
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2
        className="text-2xl font-extrabold mb-8 border-l-4 pl-4"
        style={{
          color: heading,
          borderColor: border,
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl shadow-lg p-4 flex flex-col items-center border-t-4 transition hover:scale-105"
            style={{
              background: "#fff",
              borderColor: border,
            }}
          >
            <img
              src={item.img}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-full border-4 mb-4"
              style={{ borderColor: accent }}
            />
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: heading }}
            >
              {item.name}
            </h3>
            <p
              className="text-sm mb-1 text-center"
              style={{ color: text }}
            >
              {item.desc}
            </p>
            {item.price && (
              <p
                className="text-md font-semibold mb-3"
                style={{ color: accent }}
              >
                {item.price}
              </p>
            )}
            {item.cta && (
              <button
                className="mt-auto px-4 py-1 rounded-full font-medium transition hover:brightness-110"
                style={{
                  background: accent,
                  color: "#fff",
                  boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
                }}
              >
                {item.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// Mini-navbar (not fixed, placed after sidebar)
const MiniNavbar = ({
  isAuthenticated,
  onLogin,
  onSignup,
  onLogout,
  searchValue,
  setSearchValue,
  onSearch
}) => {
  const [activeTab, setActiveTab] = useState("Home");
  const tabs = [
    "Home",
    "Perishables",
    "Snacks",
    "Beverages",
    "Grains",
    "Bakery",
    "Dairy",
    "Offers",
    "Contact"
  ];

  return (
    <nav className="w-full bg-white/90 border-b border-gray-200 shadow-sm flex flex-wrap md:flex-nowrap items-center px-4 py-2 justify-between mb-4 rounded-b-xl">
      <div className="flex flex-wrap gap-2 md:gap-4">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              activeTab === tab
                ? "bg-[#1976d2] text-white"
                : "text-[#1976d2] hover:bg-blue-50"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 md:mt-0">
        {/* Search bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            onSearch();
          }}
          className="flex items-center"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="px-3 py-1 rounded-l-full border border-[#1976d2] focus:outline-none"
            style={{ color: "#1976d2" }}
          />
          <button
            type="submit"
            className="bg-[#1976d2] text-white px-3 py-1 rounded-r-full font-semibold"
          >
            Search
          </button>
        </form>
        {/* Auth */}
        {!isAuthenticated ? (
          <>
            <button
              className="px-4 py-1 rounded-full bg-[#1976d2] text-white font-semibold ml-2"
              onClick={onLogin}
            >
              Log in
            </button>
            <button
              className="px-4 py-1 rounded-full bg-[#b71c1c] text-white font-semibold border border-[#1976d2] ml-2"
              onClick={onSignup}
            >
              Sign up
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 ml-2">
            <span className="font-semibold text-[#1976d2]">My Account</span>
            <button
              className="px-3 py-1 rounded-full bg-gray-200 text-[#1976d2] font-semibold"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Example mock data for each section
const perishables = [
  {
    name: "Fresh Cow Milk",
    desc: "Farm-fresh, pure cow milk delivered every morning.",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    price: "₹60/litre",
    cta: "Add to Cart"
  },
  {
    name: "Homemade Paneer",
    desc: "Soft, creamy paneer made from pure milk.",
    img: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
    price: "₹280/kg",
    cta: "Add to Cart"
  },
  // ...more
];
const snacks = [
  {
    name: "Roasted Almonds",
    desc: "Crunchy, protein-rich roasted almonds.",
    img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80",
    price: "₹650/kg",
    cta: "Add to Cart"
  },
  {
    name: "Masala Khakhra",
    desc: "Healthy, baked Gujarati snack.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    price: "₹80/pack",
    cta: "Add to Cart"
  },
  // ...more
];
const beverages = [
  {
    name: "Almond Milk",
    desc: "Chilled, vegan almond milk for lactose-free nutrition.",
    img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80",
    price: "₹120/litre",
    cta: "Add to Cart"
  },
  {
    name: "Greek Yogurt Smoothie",
    desc: "Probiotic-rich, natural smoothie.",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    price: "₹90/bottle",
    cta: "Add to Cart"
  },
  // ...more
];
const grains = [
  {
    name: "Basmati Rice",
    desc: "Aromatic long-grain rice, perfect for biryani.",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    price: "₹120/kg",
    cta: "Add to Cart"
  },
  {
    name: "Whole Wheat Flour",
    desc: "Stone-ground, high-fiber wheat flour.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    price: "₹45/kg",
    cta: "Add to Cart"
  },
  // ...more
];

export default function HeroSection() {
  // Simulate authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Demo handlers
  const handleLogin = () => setIsAuthenticated(true);
  const handleSignup = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);
  const handleSearch = () => {
    alert(`Searching for: ${searchValue}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fff3e0] via-white to-[#e3f2fd]">
      {/* Mini-navbar (after sidebar, not fixed to top) */}
      <div className="ml-0 md:ml-0">
        <MiniNavbar
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onLogout={handleLogout}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onSearch={handleSearch}
        />
      </div>
      {/* Hero Banner */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-12 px-4 mb-8">
        {/* Left: Headline */}
        <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ color: "#1976d2" }}
          >
            Fresh Perishables, Delivered Daily
          </h1>
          <p
            className="text-lg mb-6"
            style={{ color: "#b71c1c" }}
          >
            Discover the best dairy, bakery, and plant-based perishables for your healthy vegetarian lifestyle.
          </p>
          <button className="bg-[#1976d2] hover:bg-[#b71c1c] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md transition">
            Shop Bestsellers
          </button>
        </div>
        {/* Right: Perishables Showcase */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {perishables.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow hover:shadow-lg p-3 flex flex-col items-center transition"
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-full border-2 border-[#1976d2] mb-2"
              />
              <div className="font-bold" style={{ color: "#1976d2" }}>
                {item.name}
              </div>
              <div className="text-xs text-center" style={{ color: "#b71c1c" }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Other generalized sections */}
      <ProductSection title="Snacks" products={snacks} accentColor="yellow" />
      <ProductSection title="Beverages" products={beverages} accentColor="blue" />
      <ProductSection title="Grains & Staples" products={grains} accentColor="green" />
      {/* Add more sections as needed */}
      <footer className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-600 text-sm mt-12">
        &copy; {new Date().getFullYear()} GrocerEase. All rights reserved.
      </footer>
    </div>
  );
}
