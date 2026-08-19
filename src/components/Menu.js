import React from "react";
import "./Menu.css"; // We'll create this CSS file

function Menu({ onAddToCart, products }) {
  return (
    <section className="menu-section" id="menu">
      <h2>Our Delicious Menu</h2>
      <p className="menu-intro">A small collection of bakery favorites that look good on mobile and feel roomy on desktop.</p>
      <div className="menu-grid">
        {products.map((item) => (
          <div key={item.id} className="menu-card">
            <img src={item.image} alt={item.name} className="menu-image" />
            <h3>{item.name}</h3>
            <p className="price">₹{item.price}</p>
            <button className="order-btn" type="button" onClick={() => onAddToCart(item)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Menu;
