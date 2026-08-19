import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header-overlay">
        <p className="eyebrow">Fresh bakes, made daily</p>
        <h1>Pastry Lounge</h1>
        <p className="header-copy">Fresh & delicious every day, with a cozy bakery feel on every screen.</p>
      </div>
    </header>
  );
}

export default Header;
