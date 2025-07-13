import React from "react";

const bestPerishables = [
  {
    name: "Fresh Cow Milk",
    desc: "Farm-fresh, pure cow milk delivered every morning.",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Homemade Paneer",
    desc: "Soft, creamy paneer made from pure milk.",
    img: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Whole Wheat Bread",
    desc: "Freshly baked, healthy whole wheat bread.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Greek Yogurt",
    desc: "Rich, probiotic Greek yogurt for a healthy gut.",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Almond Milk",
    desc: "Chilled, vegan almond milk for lactose-free nutrition.",
    img: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Cheddar Cheese",
    desc: "Aged, sharp cheddar for your favorite recipes.",
    img: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80"
  }
];

const HeroSection = () => (
  <section className="w-full bg-gradient-to-r from-red-50 via-white to-red-100 py-12 px-4 mb-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
      {/* Left: Headline */}
      <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
        <h1 className="text-4xl md:text-5xl font-extrabold text-red-700 mb-4">
          Fresh Perishables, Delivered Daily
        </h1>
        <p className="text-lg text-red-500 mb-6">
          Discover the best dairy, bakery, and plant-based perishables for your healthy vegetarian lifestyle.
        </p>
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md transition">
          Shop Bestsellers
        </button>
      </div>
      {/* Right: Perishables Showcase */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {bestPerishables.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow hover:shadow-lg p-3 flex flex-col items-center transition"
          >
            <img
              src={item.img}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-full border-2 border-red-200 mb-2"
            />
            <div className="text-red-700 font-bold">{item.name}</div>
            <div className="text-xs text-red-500 text-center">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
