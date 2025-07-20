import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Topbar from "./components/Topbar";
import Home from "./pages/Home";
import Login from './pages/Login';
import Signup from "./pages/Signup";
import AdminMain from "./pages/AdminMain";
import AdminLogin from './pages/AdminLogin';
import AdminSignup from "./pages/AdminSignup";
import MyAccount from "./pages/MyAccount";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import AdminProduct from "./pages/AdminProduct";


function App() {
  const [theme, setTheme] = useState("red"); // "red" or "blue"
  const [sidebarMode, setSidebarMode] = useState(true); // true: sidebar, false: topbar
  const [cookie, setCookie] = useCookies(["token"]);
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
                  {cookie.token ? (
                  <Routes>
                    <Route path="/home" element={<Home theme={theme} />} />
                    <Route path="/MyAccount" element={< MyAccount />} />
                    <Route path="*" element={<Navigate to="/home" />} />            
                    <Route path="/admin/signup" element={<AdminSignup />} />
                    <Route path="admin/login"  element={<AdminLogin />} />
                    <Route path="/admin/main"  element={<AdminMain />} />
                    <Route path="/admin/products" element={<AdminProduct />} />
                  </Routes>
                            ) : (
                              
                    <Routes>
                        <Route path="/home" element={<Home theme={theme} />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                )}
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
