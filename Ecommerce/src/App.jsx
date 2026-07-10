import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "./utils/authContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminMain from "./pages/AdminMain";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import MyAccount from "./pages/MyAccount";
import AdminProduct from "./pages/AdminProduct";
import AdminDetails from "./pages/AdminDetails"; // <-- Correct import!
import CategoryBrowser from "./pages/Categories";
import ContactSection from "./pages/Contact";
import Order from "./pages/Order";
import AdminMessages from "./pages/AdminMessages";
import AdminUser from "./pages/AdminUser";
import AdminUserHistory from "./pages/AdminUserHistory";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import AdminReceipts from "./pages/AdminReceipts";
import AdminLists from "./pages/AdminLists";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import AdminUserDetails from "./pages/AdminUserDetails";
// ScrollToTop inside router
function ScrollWrapper({ scrollRef }) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
    window.scrollTo(0, 0); // fallback
  }, [pathname, scrollRef]);
  return null;
}

function App() {
  const [theme, setTheme] = useState("red");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isAuthenticated } = useAuth();
  const mainScrollRef = useRef(null);

  useEffect(() => {
    document.body.classList.remove("theme-red", "theme-blue");
    document.body.classList.add(theme === "red" ? "theme-red" : "theme-blue");

    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      if (!nowMobile) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const windowScroll = window.scrollY || document.documentElement.scrollTop;
      const containerScroll = mainScrollRef.current?.scrollTop || 0;
      
      if (windowScroll > 400 || containerScroll > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Also attach to the container in case it is the one scrolling
    const scrollContainer = mainScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <Router>
      <ScrollWrapper scrollRef={mainScrollRef} />
      <div className="flex min-h-screen relative">
        <ToastContainer position="bottom-right" />
        {/* Sidebar for Desktop */}
        {!isMobile && (
          <Sidebar
            theme={theme}
            setTheme={setTheme}
            isMobile={false}
            isCollapsed={!desktopSidebarOpen}
          />
        )}

        {/* Toggle Button for Desktop Sidebar */}
        {!isMobile && (
          <button
            className={`fixed top-4 z-[95] bg-red-600 text-white p-2 rounded-full shadow-md transition-all ${
              desktopSidebarOpen ? "left-56" : "left-4"
            }`}
            onClick={() => setDesktopSidebarOpen((prev) => !prev)}
            aria-label={
              desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
            }
          >
            <Icon
              icon={
                desktopSidebarOpen ? "mdi:chevron-left" : "mdi:chevron-right"
              }
              width={24}
              height={24}
            />
          </button>
        )}

        {/* Hamburger Icon for Mobile */}
        {isMobile && (
          <button
            className="fixed top-4 left-4 z-[95] bg-red-600 text-white p-2 rounded-full shadow-md"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Icon icon="mdi:menu" width={24} height={24} />
          </button>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full bg-black shadow-lg z-[95]"
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
        <div
          ref={mainScrollRef}
          className={`flex-1 overflow-auto ${!isMobile ? (desktopSidebarOpen ? "ml-64" : "ml-20") : "pt-16"} transition-all duration-300 ease-in-out relative`}
        >
          <main className="px-2 py-8 min-h-screen">
            {isAuthenticated ? (
              <Routes>
                <Route path="/" element={<Home theme={theme} />} />
                <Route path="/home" element={<Home theme={theme} />} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/signup" element={<Navigate to="/" />} />
                <Route path="/MyAccount" element={<MyAccount />} />
                <Route path="/orders" element={<Order />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/main" element={<AdminMain />} />
                <Route path="/admin/users" element={<AdminUser />} />
                <Route path="/admin/users/:id" element={<AdminUserDetails />} />
                <Route path="/orders" element={<Order />} />
                <Route path="/admin/history" element={<AdminUserHistory />} />
                <Route path="/admin/receipts" element={<AdminReceipts />} />
                <Route path="/admin/lists" element={<AdminLists />} />
                <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
                <Route
                  path="/admin/product/:id"
                  element={<AdminDetails />}
                />{" "}
                {/* <-- Dynamic details page */}
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/products" element={<AdminProduct />} />
                <Route path="/categories" element={<CategoryBrowser />} />
                <Route path="/contact" element={<ContactSection />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/home" element={<Home theme={theme} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            )}
          </main>
          <Footer />
          
          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="fixed bottom-8 right-8 z-[9999] bg-blue-600/90 backdrop-blur text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 hover:-translate-y-1 hover:shadow-blue-500/50 transition-all flex items-center justify-center border border-blue-500 cursor-pointer"
              aria-label="Scroll to top"
            >
              <Icon icon="mdi:chevron-up" width={28} height={28} />
            </button>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
