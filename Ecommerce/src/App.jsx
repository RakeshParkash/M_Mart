import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Icon } from "@iconify/react";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from './pages/Login';
import Signup from "./pages/Signup";
import AdminMain from "./pages/AdminMain";
import AdminLogin from './pages/AdminLogin';
import AdminSignup from "./pages/AdminSignup";
import MyAccount from "./pages/MyAccount";
import AdminProduct from "./pages/AdminProduct";
import AdminDetails from "./pages/AdminDetails"; // <-- Correct import!
import CategoryBrowser from "./pages/Categories";
import ContactSection from "./pages/Contact";
import Order from "./pages/Order";
import AdminMessages from "./pages/AdminMessages";
import AdminUser from "./pages/AdminUser";
import AdminUserHistory from './pages/AdminUserHistory';
import Cart from "./pages/Cart";

function App() {
  const [theme, setTheme] = useState("red");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cookie] = useCookies(["token"]);

  useEffect(() => {
    document.body.classList.remove("theme-red", "theme-blue");
    document.body.classList.add(theme === "red" ? "theme-red" : "theme-blue");

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [theme]);

  return (
    <Router>
      <div className="flex min-h-screen relative">
        <ToastContainer position="bottom-right" />
        {/* Sidebar for Desktop */}
        {!isMobile && (
          <Sidebar
            theme={theme}
            setTheme={setTheme}
            isMobile={false}
          />
        )}

        {/* Hamburger Icon for Mobile */}
        {isMobile && (
          <button
            className="fixed top-4 left-4 z-50 bg-red-600 text-white p-2 rounded-full shadow-md"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Icon icon="mdi:menu" width={24} height={24} />
          </button>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full bg-black shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                theme={theme}
                setTheme={setTheme}
                isMobile={true}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 overflow-auto ${!isMobile ? "ml-64" : "mt-27"}`}>
          <main className="px-2 py-8">
            {cookie.token ? (
              <Routes>
                <Route path="/" element={<Home theme={theme} />} />
                <Route path="/MyAccount" element={<MyAccount />} />
                <Route path="/orders" element={<Order />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/main" element={<AdminMain />} />
                <Route path="/admin/users" element={<AdminUser />} />
                <Route path="/orders" element={<Order />} />
                <Route path="/admin/history" element={<AdminUserHistory />} />
                <Route path="/admin/product/:id" element={<AdminDetails />} /> {/* <-- Dynamic details page */}
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/products" element={<AdminProduct />} />
                <Route path="/categories" element={<CategoryBrowser />} />
                <Route path="/contact" element={<ContactSection />} />
                <Route path="*" element={<Navigate to="/" />} />
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