
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


const Home = ({ theme = "red" }) => (
  <div
    className="min-h-screen w-full"
    style={{
      background: "linear-gradient(135deg, var(--bg-main, #fff) 0%, var(--bg-secondary, #f3f3f3) 100%)",
      color: "var(--text-main, #222)",
      transition: "background 0.4s",
    }}
  >
    <HeroSection theme={theme} />
    <Newsletter theme={theme} />

  </div>
);

export default Home;
