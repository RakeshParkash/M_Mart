import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="lux-header">
      <div className="lux-header__container">
        <span className="lux-header__logo">M. MART</span>
        <span className="lux-header__greeting"></span>
      </div>
    </header>
  );
};

export default Header;
