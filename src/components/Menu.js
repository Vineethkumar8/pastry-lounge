import React from "react";
import "./Menu.css"; // We'll create this CSS file

function Menu({ onAddToCart, onIncreaseItem, onDecreaseItem, products, cartQuantities }) {
  return (
    <section className="menu-section" id="menu">
      <h2>Our Delicious Menu</h2>
      <p className="menu-intro">A small collection of bakery favorites that look good on mobile and feel roomy on desktop.</p>
      <div className="menu-grid">
        {products.map((item) => (
          <div key={item.id} className="menu-card">
            {item.image ? (
              <img src={item.image} alt={item.name} className="menu-image" />
            ) : (
              <div className="menu-image menu-image-placeholder">
                <span>No image</span>
              </div>
            )}
            <h3>{item.name}</h3>
            <p className="price">₹{item.price}</p>
            {cartQuantities[item.id] ? (
              <div className="menu-qty-controls">
                <button type="button" className="qty-btn" onClick={() => onDecreaseItem(item.id, -1)}>-</button>
                <span className="qty-value">{cartQuantities[item.id]}</span>
                <button type="button" className="qty-btn" onClick={() => onIncreaseItem(item.id, 1)}>+</button>
              </div>
            ) : (
              <button className="order-btn" type="button" onClick={() => onAddToCart(item)}>
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Menu;
