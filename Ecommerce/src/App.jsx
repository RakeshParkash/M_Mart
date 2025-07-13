import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Home from "./pages/Home";

function App() {
  const [theme, setTheme] = useState("red"); // "red" or "blue"
  const [sidebarMode, setSidebarMode] = useState(true); // true: sidebar, false: topbar

  // Set theme class on <body>
  useEffect(() => {
    document.body.classList.remove("theme-red", "theme-blue");
    document.body.classList.add(theme === "red" ? "theme-red" : "theme-blue");
  }, [theme]);

  return (
    <Router>
      <div className="ml-64 min-h-screen flex">
        {sidebarMode ? (
          <Sidebar
            theme={theme}
            setTheme={setTheme}
            sidebarMode={sidebarMode}
            setSidebarMode={setSidebarMode}
          />
        ) : (
          <Topbar
            theme={theme}
            setTheme={setTheme}
            sidebarMode={sidebarMode}
            setSidebarMode={setSidebarMode}
          />
        )}
        <div className={`flex-1 min-h-screen overflow-auto ${sidebarMode ? "" : "pt-16"}`}>
          <main className="px-2 py-8">
            <Routes>
              <Route path="/" element={<Home theme={theme} />} />
              
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
