import React from 'react';
import Ourmain from '../hoc/Ourmain';
import './Home.css';

const demoProducts = [
  { img: '/images/str-milk.jpg', name: 'Fresh Milk', price: '₹60', desc: '1L, Organic' },
  { img: '/images/str-bread.jpg', name: 'Brown Bread', price: '₹40', desc: '400g, Whole Wheat' },
];

const Home = () => (
  <div className="home">
    {/* Hero Section */}
    <section className="hero-section">
      <h1 className="hero-title">Welcome to M. Mart</h1>
      <p className="hero-subtitle">Your one-stop shop for daily essentials, fresh groceries, and more.</p>
      <button className="hero-cta">Shop Now</button>
    </section>

    {/* Product Grid */}
    <section className="mart-products">
      <h2>Popular Products</h2>
      <div className="products-grid">
        {demoProducts.map((item, idx) => (
          <div className="product-card" key={idx}>
            <img src={item.img} alt={item.name} />
            <h3>{item.name}</h3>
            <p className="product-desc">{item.desc}</p>
            <p className="product-price">{item.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Ourmain(Home);
