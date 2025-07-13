// import React from "react";
// import HeroSection from "../components/Herosection";


// const products = [
//   {
//     name: "Cow Milk",
//     desc: "Fresh, pure cow milk. Delivered daily.",
//     price: "₹60/litre",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Whole Wheat Flour",
//     desc: "Stone-ground, high-fiber wheat flour.",
//     price: "₹45/kg",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Basmati Rice",
//     desc: "Aromatic long-grain rice, perfect for biryani.",
//     price: "₹120/kg",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Organic Ghee",
//     desc: "Pure desi ghee made from cow's milk.",
//     price: "₹400/500ml",
//     img: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Paneer Cubes",
//     desc: "Fresh, soft paneer. Perfect for curries.",
//     price: "₹280/kg",
//     img: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Almonds",
//     desc: "Premium quality, raw whole almonds.",
//     price: "₹650/kg",
//     img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Poha (Flattened Rice)",
//     desc: "Light and easy to cook for breakfast.",
//     price: "₹60/500g",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Soya Chunks",
//     desc: "Protein-rich soya nuggets for curries.",
//     price: "₹80/500g",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
//   }
// ];

// const snacks = [
//   {
//     name: "Roasted Almonds",
//     desc: "Crunchy, protein-rich roasted almonds.",
//     price: "₹650/kg",
//     img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Masala Khakhra",
//     desc: "Healthy, baked Gujarati snack.",
//     price: "₹80/pack",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
//   }
// ];

// const beverages = [
//   {
//     name: "Almond Milk",
//     desc: "Chilled, vegan almond milk for lactose-free nutrition.",
//     price: "₹120/litre",
//     img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Greek Yogurt Smoothie",
//     desc: "Probiotic-rich, natural smoothie.",
//     price: "₹90/bottle",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
//   }
// ];

// const grains = [
//   {
//     name: "Basmati Rice",
//     desc: "Aromatic long-grain rice, perfect for biryani.",
//     price: "₹120/kg",
//     img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Whole Wheat Flour",
//     desc: "Stone-ground, high-fiber wheat flour.",
//     price: "₹45/kg",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
//   }
// ];

// const bakery = [
//   {
//     name: "Whole Wheat Bread",
//     desc: "Freshly baked, healthy whole wheat bread.",
//     price: "₹40/loaf",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     name: "Multigrain Buns",
//     desc: "Soft buns packed with grains and seeds.",
//     price: "₹60/pack",
//     img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
//   }
// ];

// const recipes = [
//   {
//     title: "Paneer Butter Masala",
//     desc: "Creamy and flavorful paneer curry.",
//     img: "https://images.unsplash.com/photo-1604908177523-0b6f8a9c8a3d?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     title: "Almond Milkshake",
//     desc: "Refreshing and healthy almond milkshake.",
//     img: "https://images.unsplash.com/photo-1556910103-1f9a6a0f3b0f?auto=format&fit=crop&w=400&q=80"
//   },
//   {
//     title: "Whole Wheat Bread Sandwich",
//     desc: "Tasty sandwich with fresh veggies and cheese.",
//     img: "https://images.unsplash.com/photo-1562967916-eb82221dfb43?auto=format&fit=crop&w=400&q=80"
//   }
// ];

// const Newsletter = () => (
//   <section className="max-w-6xl mx-auto px-4 py-12 bg-[var(--bg-secondary)]/20 rounded-xl my-12 text-center">
//     <h2 className="text-3xl font-bold text-[var(--bg-main)] mb-4">Stay Updated</h2>
//     <p className="text-[var(--accent)] mb-6">
//       Subscribe to our newsletter for the latest deals and recipes.
//     </p>
//     <form className="flex justify-center gap-4 max-w-md mx-auto">
//       <input
//         type="email"
//         placeholder="Your email address"
//         className="px-4 py-2 rounded-l-lg border border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
//       />
//       <button
//         type="submit"
//         className="bg-[var(--accent)] hover:bg-[var(--bg-main)] text-white px-6 rounded-r-lg font-semibold transition"
//       >
//         Subscribe
//       </button>
//     </form>
//   </section>
// );

// const ProductSection = ({ title, products, accentColor = "red" }) => (
//   <section className="max-w-6xl mx-auto px-4 py-8">
//     <h2
//       className={`text-2xl font-semibold mb-8 text-${accentColor}-800 border-l-4 border-${accentColor}-400 pl-4`}
//     >
//       {title}
//     </h2>
//     <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//       {products.map((item, idx) => (
//         <div
//           key={idx}
//           className={`bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border-t-4 border-${accentColor}-400 hover:border-${accentColor}-600 transition animate-fade-in`}
//         >
//           <img
//             src={item.img}
//             alt={item.name}
//             className={`w-24 h-24 object-cover rounded-full border-4 border-${accentColor}-200 mb-4`}
//           />
//           <h3 className={`text-lg font-bold text-${accentColor}-700 mb-2`}>
//             {item.name}
//           </h3>
//           <p className={`text-sm text-${accentColor}-500 mb-1 text-center`}>
//             {item.desc}
//           </p>
//           {item.price && (
//             <p className={`text-md font-semibold text-${accentColor}-500 mb-3`}>
//               {item.price}
//             </p>
//           )}
//           {item.cta && (
//             <button
//               className={`mt-auto px-4 py-1 bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white rounded-full font-medium transition`}
//             >
//               {item.cta}
//             </button>
//           )}
//         </div>
//       ))}
//     </div>
//   </section>
// );

// const RecipesSection = ({ recipes }) => (
//   <section className="max-w-6xl mx-auto px-4 py-12">
//     <h2 className="text-3xl font-bold mb-8 text-[var(--bg-main)] border-l-4 border-[var(--accent)] pl-4">
//       Featured Recipes
//     </h2>
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       {recipes.map((recipe, idx) => (
//         <div
//           key={idx}
//           className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer"
//         >
//           <img
//             src={recipe.img}
//             alt={recipe.title}
//             className="w-full h-48 object-cover"
//           />
//           <div className="p-4">
//             <h3 className="text-xl font-semibold text-[var(--bg-main)] mb-2">
//               {recipe.title}
//             </h3>
//             <p className="text-[var(--accent)] text-sm">{recipe.desc}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   </section>
// );

// const Home = () => (
//   <div
//     className="min-h-screen w-full"
//     style={{
//       background: "var(--bg-main)",
//       color: "var(--text-main)",
//       transition: "background 0.4s"
//     }}
//   >
//     {/* Hero Section */}
//     <HeroSection />

//     {/* Multiple Product Sections */}
//     <ProductSection title="Popular Products" products={products} accentColor="red" />
//     <ProductSection title="Snacks" products={snacks} accentColor="yellow" />
//     <ProductSection title="Beverages" products={beverages} accentColor="blue" />
//     <ProductSection title="Grains & Staples" products={grains} accentColor="green" />
//     <ProductSection title="Bakery" products={bakery} accentColor="purple" />

//     {/* Featured Recipes */}
//     <RecipesSection recipes={recipes} />

//     {/* Newsletter Signup */}
//     <Newsletter />

//     {/* Footer */}
//     <footer className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-500 text-sm mt-12">
//       &copy; {new Date().getFullYear()} GrocerEase. All rights reserved.
//     </footer>
//   </div>
// );

// export default Home;


import React, { useContext } from "react";
import HeroSection from "../components/Herosection";

// Utility: get headline color based on theme
// You should pass the current theme to Home as a prop ("red" or "blue")
const getHeadlineColors = (theme) => {
  // If red theme (dark), use blue for headlines; if blue theme (light), use red.
  if (theme === "red") {
    return {
      headline: "#1976d2",         // vivid blue
      accent: "#0d47a1",           // dark blue
      border: "#1976d2",
    };
  } else {
    return {
      headline: "#d32f2f",         // vivid red
      accent: "#b71c1c",           // dark red
      border: "#d32f2f",
    };
  }
};

const ProductSection = ({ title, products, theme, accentColor = "red" }) => {
  const { headline, accent, border } = getHeadlineColors(theme);
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2
        className="text-2xl font-extrabold mb-8 border-l-4 pl-4"
        style={{
          color: headline,
          borderColor: border,
          letterSpacing: "0.01em",
          textShadow: "0 1px 2px rgba(0,0,0,0.06)",
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
              background: "var(--card-bg, #fff)",
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
              style={{ color: accent }}
            >
              {item.name}
            </h3>
            <p
              className="text-sm mb-1 text-center"
              style={{ color: headline, opacity: 0.85 }}
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

const RecipesSection = ({ recipes, theme }) => {
  const { headline, accent, border } = getHeadlineColors(theme);
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2
        className="text-3xl font-bold mb-8 border-l-4 pl-4"
        style={{
          color: headline,
          borderColor: border,
          letterSpacing: "0.01em",
          textShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        Featured Recipes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recipes.map((recipe, idx) => (
          <div
            key={idx}
            className="rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer"
            style={{ background: "var(--card-bg, #fff)" }}
          >
            <img
              src={recipe.img}
              alt={recipe.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: accent }}
              >
                {recipe.title}
              </h3>
              <p className="text-sm" style={{ color: headline, opacity: 0.85 }}>
                {recipe.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Newsletter = ({ theme }) => {
  const { headline, accent, border } = getHeadlineColors(theme);
  return (
    <section
      className="max-w-6xl mx-auto px-4 py-12 rounded-xl my-12 text-center"
      style={{
        background: "var(--bg-secondary, #f3f3f3)",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
      }}
    >
      <h2 className="text-3xl font-bold mb-4" style={{ color: headline }}>
        Stay Updated
      </h2>
      <p className="mb-6" style={{ color: accent }}>
        Subscribe to our newsletter for the latest deals and recipes.
      </p>
      <form className="flex justify-center gap-4 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Your email address"
          className="px-4 py-2 rounded-l-lg border focus:outline-none focus:ring-2"
          style={{
            borderColor: accent,
            color: accent,
            background: "#fff",
          }}
        />
        <button
          type="submit"
          className="px-6 rounded-r-lg font-semibold transition"
          style={{
            background: accent,
            color: "#fff",
          }}
        >
          Subscribe
        </button>
      </form>
    </section>
  );
};

const products = [
  {
    name: "Cow Milk",
    desc: "Fresh, pure cow milk. Delivered daily.",
    price: "₹60/litre",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Whole Wheat Flour",
    desc: "Stone-ground, high-fiber wheat flour.",
    price: "₹45/kg",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Basmati Rice",
    desc: "Aromatic long-grain rice, perfect for biryani.",
    price: "₹120/kg",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Organic Ghee",
    desc: "Pure desi ghee made from cow's milk.",
    price: "₹400/500ml",
    img: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Paneer Cubes",
    desc: "Fresh, soft paneer. Perfect for curries.",
    price: "₹280/kg",
    img: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Almonds",
    desc: "Premium quality, raw whole almonds.",
    price: "₹650/kg",
    img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Poha (Flattened Rice)",
    desc: "Light and easy to cook for breakfast.",
    price: "₹60/500g",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Soya Chunks",
    desc: "Protein-rich soya nuggets for curries.",
    price: "₹80/500g",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  }
];

const snacks = [
  {
    name: "Roasted Almonds",
    desc: "Crunchy, protein-rich roasted almonds.",
    price: "₹650/kg",
    img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Masala Khakhra",
    desc: "Healthy, baked Gujarati snack.",
    price: "₹80/pack",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  }
];

const beverages = [
  {
    name: "Almond Milk",
    desc: "Chilled, vegan almond milk for lactose-free nutrition.",
    price: "₹120/litre",
    img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Greek Yogurt Smoothie",
    desc: "Probiotic-rich, natural smoothie.",
    price: "₹90/bottle",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  }
];

const grains = [
  {
    name: "Basmati Rice",
    desc: "Aromatic long-grain rice, perfect for biryani.",
    price: "₹120/kg",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Whole Wheat Flour",
    desc: "Stone-ground, high-fiber wheat flour.",
    price: "₹45/kg",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  }
];

const bakery = [
  {
    name: "Whole Wheat Bread",
    desc: "Freshly baked, healthy whole wheat bread.",
    price: "₹40/loaf",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Multigrain Buns",
    desc: "Soft buns packed with grains and seeds.",
    price: "₹60/pack",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  }
];

const recipes = [
  {
    title: "Paneer Butter Masala",
    desc: "Creamy and flavorful paneer curry.",
    img: "https://images.unsplash.com/photo-1604908177523-0b6f8a9c8a3d?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Almond Milkshake",
    desc: "Refreshing and healthy almond milkshake.",
    img: "https://images.unsplash.com/photo-1556910103-1f9a6a0f3b0f?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Whole Wheat Bread Sandwich",
    desc: "Tasty sandwich with fresh veggies and cheese.",
    img: "https://images.unsplash.com/photo-1562967916-eb82221dfb43?auto=format&fit=crop&w=400&q=80"
  }
];


const Home = ({ theme = "red" }) => (
  <div
    className="min-h-screen w-full"
    style={{
      background: "linear-gradient(135deg, var(--bg-main, #fff) 0%, var(--bg-secondary, #f3f3f3) 100%)",
      color: "var(--text-main, #222)",
      transition: "background 0.4s",
    }}
  >
    {/* Hero Section */}
    <HeroSection theme={theme} />

    {/* Product Sections with dynamic headline colors */}
    <ProductSection title="Popular Products" products={products} theme={theme} accentColor={theme === "red" ? "blue" : "red"} />
    <ProductSection title="Snacks" products={snacks} theme={theme} accentColor="yellow" />
    <ProductSection title="Beverages" products={beverages} theme={theme} accentColor="blue" />
    <ProductSection title="Grains & Staples" products={grains} theme={theme} accentColor="green" />
    <ProductSection title="Bakery" products={bakery} theme={theme} accentColor="purple" />

    {/* Featured Recipes */}
    <RecipesSection recipes={recipes} theme={theme} />

    {/* Newsletter Signup */}
    <Newsletter theme={theme} />

    {/* Footer */}
    <footer className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-500 text-sm mt-12">
      &copy; {new Date().getFullYear()} GrocerEase. All rights reserved.
    </footer>
  </div>
);

export default Home;
