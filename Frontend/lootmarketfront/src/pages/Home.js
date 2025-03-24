import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import bannerImage from "lootmarketfront/public/banner.png"; // Import the image

const Home = () => {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Add Story Function
  const addStory = () => {
    const newStory = { id: stories.length + 1, content: `Story ${stories.length + 1}` };
    setStories([...stories, newStory]);
  };

  // Add Product Function
  const addProduct = () => {
    const newProduct = { id: products.length + 1, name: `Product ${products.length + 1}` };
    setProducts([...products, newProduct]);
  };

  return (
    <div className="home-container">
      {/* Ensure no <Router> is used here */}
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <div className="logo-img"></div> {/* Space for logo */}
          <div className="logo-text">LootMarket</div>
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/">Products</a>
          <a href="/">Help</a>
          <a href="/">About Us</a>
        </div>
        <div className="nav-icons">
          <div className="search-container">
            <input type="text" placeholder="Search" className="search-bar" />
            <img src="/search.png" alt="Search" className="search-icon" />
          </div>
          {/* Other navbar items */}
          <img src="/profile.png" alt="Profile" className="profile-icon" onClick={() => navigate("/profile")} />
        </div>
      </nav>

      {/* Banner */}
      <div className="banner" style={{ backgroundImage: `url(${bannerImage})` }}></div> {/* Using the imported image */}

      {/* Stories Section */}
      <div className="stories-section">
        <h2>Stories</h2>
        <div className="stories-container">
          <div className="stories">
            <div className="story add-story" onClick={addStory}>
              <span>+</span>
            </div>
            {stories.map((story) => (
              <div key={story.id} className="story">
                <div className="story-content">{story.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <hr className="section-divider" />

      {/* Products Section */}
      <div className="products-section">
        <h2>Products</h2>
        <div className="products-container">
          <div className="products">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src="/placeholder.svg" alt="Product" className="product-image" />
                </div>
                <div className="product-details">
                  <div className="product-name">{product.name}</div>
                  <div className="product-seller">Seller Name</div>
                  <div className="product-footer">
                    <div className="product-price">PHP 599.00</div>
                    <button className="like-button">❤️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Product Button */}
      <button className="add-product-button" onClick={addProduct}>+ Add Product</button>
    </div>
  );
};

export default Home;