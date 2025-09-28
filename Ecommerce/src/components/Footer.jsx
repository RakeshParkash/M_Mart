import React from 'react';
import { NavLink } from 'react-router-dom';



const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/categories' },
  // { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  // { label: 'Offers', to: '/offers' },
  { label: 'Admin', to: '/admin/login ' },
];

const socialLinks = [
];

const Footer = () => (
  <footer className="w-full border-t bg-gradient-to-r from-blue-700 via-red-800 to-red-500 text-white">
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:justify-between md:items-center gap-10">
      {/* Logo and Tagline */}
      <div className="flex flex-col items-center md:items-start">
        <span className="text-3xl font-extrabold tracking-wider drop-shadow">
          M.<span className="text-yellow-400"> Mart</span>
        </span>
        <span className="text-sm mt-2 text-yellow-300 font-medium">
          Fresh. Local. Vegetarian.
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-wrap gap-6 justify-center md:justify-start">
        {footerLinks.map(link => (
          <NavLink
            key={link.label}
            to={link.to}
            className="text-base font-semibold hover:text-yellow-400 transition duration-150"
            style={{ color: "inherit" }}
            aria-label={link.label}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Socials and Contact */}
      <div className="flex flex-col items-center md:items-end gap-2">
        {/* Socials */}
        {socialLinks.length > 0 && (
          <div className="flex gap-4 mb-1">
            {socialLinks.map(s => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition"
                aria-label={s.label}
                style={{ color: "#ffd600", fontSize: "1.5rem" }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}
        {/* Contact Info */}
        <span className="text-xs opacity-80">example@mart.com</span>
        <span className="text-xs opacity-80">+91 1234567890</span>
      </div>
    </div>
    <div className="w-full text-center py-4 text-xs bg-black bg-opacity-10 text-white">
      &copy; {new Date().getFullYear()} <span className="font-bold">M. Mart</span>. All rights reserved.
    </div>
  </footer>
);

export default Footer;
