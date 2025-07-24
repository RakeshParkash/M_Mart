
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
