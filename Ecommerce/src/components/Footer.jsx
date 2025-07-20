import React from 'react';
import { NavLink } from 'react-router-dom';



const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Offers', to: '/offers' },
  { label: 'Admin', to: '/admin/login' },
];

const socialLinks = [
];

const Footer = () => (
  <footer
    className="w-full border-t"
    style={{
      background: "linear-gradient(90deg, #1976d2 0%, #b71c1c 100%)",
      color: "#fff",
      borderColor: "#d32f2f"
    }}
  >
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between items-center gap-8">
      {/* Logo and tagline */}
      <div className="flex flex-col items-center md:items-start">
        <span className="text-2xl font-extrabold tracking-wider" style={{ color: "#fff" }}>
          M.<span style={{ color: "#ffd600" }}> Mart</span>
        </span>
        <span className="text-sm mt-2 opacity-90" style={{ color: "#ffd600" }}>
          Fresh. Local. Vegetarian.
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-wrap gap-6 justify-center">
        {footerLinks.map(link => (
          <NavLink
            key={link.label}
            to={link.to}
            className="text-base font-semibold opacity-90 hover:opacity-100 hover:underline transition"
            style={{ color: "#fff" }}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Socials and contact */}
      <div className="flex flex-col items-center md:items-end gap-2">
        <div className="flex gap-4 mb-1">
          {socialLinks.map(s => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition"
              title={s.label}
              style={{ color: "#ffd600", fontSize: "1.5rem" }}
            >
              <span aria-label={s.label}>{s.icon}</span>
            </a>
          ))}
        </div>
        <span className="text-xs opacity-80" style={{ color: "#fff" }}>
          example@.com
        </span>
        <span className="text-xs opacity-80" style={{ color: "#fff" }}>
          +91 to be there
        </span>
      </div>
    </div>
    <div className="w-full text-center py-4 text-xs" style={{ background: "rgba(0,0,0,0.08)", color: "#fff" }}>
      &copy; {new Date().getFullYear()} M. Mart. All rights reserved.
    </div>
  </footer>
);

export default Footer;
