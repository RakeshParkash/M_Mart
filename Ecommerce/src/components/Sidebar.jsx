import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const NAV_SECTIONS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" }
];

export default function Sidebar({ onShowSettings }) {
  return (
    <nav className="luxury-sidebar">
      <div className="logo-container">
        <NavLink to="/" className="logo-text">
          M. MART
        </NavLink>
      </div>
      <ul className="nav-links">
        {NAV_SECTIONS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => isActive ? "active" : ""}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-settings-btn">
        <button className="settings-link" onClick={onShowSettings}>
          Settings
        </button>
      </div>
    </nav>
  );
}
