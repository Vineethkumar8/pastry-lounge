import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import brandImage from "./assets/cup-cakes.jpg";
import cakeImg from "./assets/cup-cakes.jpg";
import cakesImg from "./assets/cakes.jpg";
import donutsImg from "./assets/donuts.jpg";
import "./App.css";

const defaultProducts = [
  { id: 1, name: "Cupcake", price: 250, image: cakeImg },
  { id: 2, name: "Cakes", price: 50, image: cakesImg },
  { id: 3, name: "Donuts", price: 30, image: donutsImg },
];

const storageKey = "pastry-lounge-menu";
const publicEmail = "orders@yourbakery.com";
const publicAddress = "Your bakery address here";
const publicWhatsAppNumber = "1234";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [products, setProducts] = useState(defaultProducts);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    imageFile: null,
    imagePreview: "",
  });
  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    const savedProducts = window.localStorage.getItem(storageKey);
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length) {
          setProducts(parsed);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(products));
  }, [products]);

  const cartSummary = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { itemCount, total };
  }, [cart]);

  const cartQuantities = useMemo(() => {
    return cart.reduce((accumulator, item) => {
      accumulator[item.id] = item.quantity;
      return accumulator;
    }, {});
  }, [cart]);

  const deliveryFee = cartSummary.total > 0 ? 40 : 0;
  const grandTotal = cartSummary.total + deliveryFee;

  const adminIsAuthenticated = adminUnlocked;

  const orderDetails = useMemo(() => {
    if (!cart.length) {
      return "No items selected yet.";
    }

    return cart
      .map((item) => `${item.name} x${item.quantity} = ₹${item.price * item.quantity}`)
      .join("\n");
  }, [cart]);

  const orderMessage = useMemo(() => {
    const lines = [
      `Name: ${orderForm.name || "N/A"}`,
      `Phone: ${orderForm.phone || "N/A"}`,
      `Address: ${orderForm.address || "N/A"}`,
      `Note: ${orderForm.note || "None"}`,
      "",
      "Items:",
      orderDetails,
      "",
      `Item total: ₹${cartSummary.total}`,
      `Delivery: ₹${deliveryFee}`,
      `Grand total: ₹${grandTotal}`,
    ];

    return lines.join("\n");
  }, [cartSummary.total, deliveryFee, grandTotal, orderDetails, orderForm.address, orderForm.name, orderForm.note, orderForm.phone]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const handleNewItemChange = (event) => {
    const { name, value } = event.target;
    setNewItem((current) => ({ ...current, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setNewItem((current) => ({ ...current, imageFile: null, imagePreview: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewItem((current) => ({
        ...current,
        imageFile: file,
        imagePreview: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddMenuItem = (event) => {
    event.preventDefault();

    if (!newItem.name.trim() || !newItem.price) {
      window.alert("Please add a name and price for the new menu item.");
      return;
    }

    const nextItem = {
      id: Date.now(),
      name: newItem.name.trim(),
      price: Number(newItem.price),
      image: newItem.imagePreview || "",
    };

    setProducts((current) => [nextItem, ...current]);
    setNewItem({ name: "", price: "", imageFile: null, imagePreview: "" });
  };

  const handleAdminLogin = (event) => {
    event.preventDefault();

    if (adminPassword === "bakery123") {
      setAdminUnlocked(true);
      setAdminPassword("");
      setAdminError("");
      return;
    }

    setAdminError("Incorrect admin password. Try bakery123.");
  };

  const handleAdminLogout = () => {
    setAdminUnlocked(false);
    setAdminPassword("");
    setAdminError("");
  };

  const updateQuantity = (id, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setOrderForm((current) => ({ ...current, [name]: value }));
  };

  const handleEmailOrder = () => {
    const subject = encodeURIComponent(`Bakery order for ${orderForm.name || "customer"}`);
    const body = encodeURIComponent(orderMessage);
    window.location.href = `mailto:${publicEmail}?subject=${subject}&body=${body}`;
  };

  const handleShareOrder = async () => {
    if (publicWhatsAppNumber.trim()) {
      const text = encodeURIComponent(orderMessage);
      window.open(`https://wa.me/${publicWhatsAppNumber.trim()}?text=${text}`, "_blank", "noopener,noreferrer");
      return;
    }

    const shareData = {
      title: "Pastry Lounge order",
      text: orderMessage,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through to clipboard copy
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(orderMessage);
      window.alert("Order details copied. Add your WhatsApp number in the code later, or paste this into WhatsApp now.");
      return;
    }

    window.alert(orderMessage);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!cart.length) {
      window.alert("Please add at least one item to your cart before placing the order.");
      return;
    }

    handleEmailOrder();
    setOrderSuccess(true);
    window.setTimeout(() => setOrderSuccess(false), 5000);
  };

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <img src={brandImage} alt="Pastry Lounge bakery" className="brand-image" />
          <div>
            <strong>Pastry Lounge</strong>
            <span>Bakery & custom orders</span>
          </div>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`} id="site-nav">
          <a href="#menu" onClick={() => setMenuOpen(false)}>Menu</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#order" onClick={() => setMenuOpen(false)}>Order</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <button className="nav-admin-btn" type="button" onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}>
            Cart ({cartSummary.itemCount})
          </button>
          {adminIsAuthenticated ? (
            <button className="nav-admin-btn" type="button" onClick={handleAdminLogout}>
              Logout
            </button>
          ) : (
            <button
              className="nav-admin-btn"
              type="button"
              onClick={() => document.getElementById("admin")?.scrollIntoView({ behavior: "smooth" })}
            >
              Admin
            </button>
          )}
        </div>
      </nav>

      <Header />
      <section className="hero-strip">
        <div className="hero-note">
          <p className="section-tag">Welcome</p>
          <h2>Warm bakes, friendly ordering, and a simple admin view.</h2>
          <p>
            Everything is laid out to be easy on the eyes and easy to use.
          </p>
        </div>
        <div className="hero-badge">
          <strong>Fresh</strong>
          <span>Daily bakery menu</span>
          <span>Simple ordering flow</span>
        </div>
      </section>

      <Menu
        onAddToCart={addToCart}
        onIncreaseItem={updateQuantity}
        onDecreaseItem={updateQuantity}
        products={products}
        cartQuantities={cartQuantities}
      />

      {!adminIsAuthenticated ? (
        <section className="admin-section" id="admin">
          <div className="admin-copy">
            <p className="section-tag">Admin login</p>
            <h2>Sign in to manage the menu</h2>
            <p>
              This keeps the menu editor tucked away instead of open to everyone. Use the password to unlock the admin tools.
            </p>
          </div>

          <form className="admin-form" onSubmit={handleAdminLogin}>
            <label>
              Admin password
              <input
                name="password"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder="Enter admin password"
              />
            </label>
            {adminError && <p className="form-error">{adminError}</p>}
            <button className="submit-btn" type="submit">Unlock admin</button>
          </form>
        </section>
      ) : (
        <section className="admin-section" id="admin">
          <div className="admin-copy">
            <p className="section-tag">Admin</p>
            <h2>Add menu items and prices</h2>
            <p>
              Use this panel to create new bakery items directly in the app. The menu saves in this browser, so your updates stay after refresh.
            </p>
            <button className="ghost-btn" type="button" onClick={handleAdminLogout}>
              Lock admin
            </button>
          </div>

          <form className="admin-form" onSubmit={handleAddMenuItem}>
            <label>
              Item name
              <input name="name" value={newItem.name} onChange={handleNewItemChange} placeholder="Strawberry Tart" />
            </label>
            <label>
              Price
              <input name="price" type="number" min="1" value={newItem.price} onChange={handleNewItemChange} placeholder="120" />
            </label>
            <label>
              Upload image from device
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => setNewItem((current) => ({ ...current, imageFile: null, imagePreview: "" }))}
            >
              Remove image
            </button>
            <button className="submit-btn" type="submit">Add item</button>
          </form>
        </section>
      )}

      <section className="info-section" id="about">
        <div>
          <p className="section-tag">About us</p>
          <h2>Handmade bakes for everyday moments</h2>
          <p>
            We bake soft cakes, warm donuts, and sweet treats that are perfect for
            birthdays, small celebrations, or a late-night craving.
          </p>
        </div>
        <div className="info-card">
          <h3>Why customers come back</h3>
          <ul>
            <li>Freshly prepared every morning</li>
            <li>Custom cake requests available</li>
            <li>Quick mobile-friendly ordering</li>
          </ul>
        </div>
      </section>

      <section className="order-section" id="order">
        <div className="cart-panel">
          <div className="panel-head">
            <div className="order-copy">
              <p className="section-tag">Your cart</p>
              <h2>Review your order</h2>
              <p className="section-copy">
                Adjust quantities, remove items, or clear the cart before you send the order.
              </p>
            </div>
            {cart.length > 0 && (
              <button className="ghost-btn" type="button" onClick={clearCart}>
                Clear cart
              </button>
            )}
          </div>
          {cart.length === 0 ? (
            <div className="cart-empty-visual">
              <p className="empty-state">Your cart is empty. Add a few items from the menu above.</p>
              <p className="section-copy">
                A small delivery fee is added only when your cart has items, so the total stays easy to understand.
              </p>
            </div>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-thumb" />
                  <div className="cart-item-copy">
                    <strong>{item.name}</strong>
                    <p>₹{item.price} each</p>
                  </div>
                  <div className="cart-actions">
                    <div className="quantity-controls">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <button className="remove-btn" type="button" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="cart-summary-strip">
            <div className="cart-summary-row">
              <span>Items</span>
              <strong>{cartSummary.itemCount}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>₹{cartSummary.total}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Delivery</span>
              <strong>₹{deliveryFee}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Grand total</span>
              <strong>₹{grandTotal}</strong>
            </div>
          </div>
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          <div className="order-copy">
            <p className="section-tag">Place order</p>
            <h2>Contact and delivery details</h2>
            <p className="section-copy">
              Fill in the details below and place the order right here. The flow is kept on one page like a food delivery app.
            </p>
          </div>
          <div className="checkout-note">
            Tip: the admin panel is locked until you sign in, and your menu changes stay saved in this browser.
          </div>
          <label>
            Full name
            <input name="name" value={orderForm.name} onChange={handleInputChange} required />
          </label>
          <label>
            Phone number
            <input name="phone" value={orderForm.phone} onChange={handleInputChange} required />
          </label>
          <label>
            Delivery address
            <textarea name="address" value={orderForm.address} onChange={handleInputChange} rows="3" required />
          </label>
          <label>
            Special note
            <textarea name="note" value={orderForm.note} onChange={handleInputChange} rows="3" placeholder="Eggless, less sugar, gift wrap..." />
          </label>
          <div className="order-actions">
            <button className="submit-btn" type="submit">Email order</button>
            <button className="whatsapp-btn" type="button" onClick={handleShareOrder}>
              Share order
            </button>
          </div>
        </form>
      </section>

      {orderSuccess && (
        <div className="success-toast" role="status" aria-live="polite">
          <div>
            <strong>Order ready</strong>
            <p>Your email order has been prepared. You can also send it on WhatsApp.</p>
          </div>
          <button type="button" onClick={() => setOrderSuccess(false)}>
            Close
          </button>
        </div>
      )}

      <section className="contact-section" id="contact">
        <div>
          <p className="section-tag">Contact</p>
          <h2>Visit or message us</h2>
          <p>{publicAddress}</p>
          <p>WhatsApp number can be added later</p>
          <p>{publicEmail}</p>
        </div>
        <div className="hours-card">
          <h3>Open daily</h3>
          <p>8:00 AM - 9:00 PM</p>
          <p>Pickup and delivery available</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
