import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import bannerImage from "lootmarketfront/public/banner.png";
import StoryViewer from "../assets/components/StoryViewer";
import CreatePost from "../assets/components/CreatePost";
import axios from "axios";

const Home = () => {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Retrieve user ID from local storage
        if (!userId) {
          alert("User not logged in. Please log in first.");
          return;
        }

        const response = await axios.get("http://localhost:5000/stories", {
          headers: { "user-id": userId },
        });
        setStories(response.data.stories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  const addStory = (newStory) => {
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
            <div
              className="story add-story"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <span>+</span>
            </div>
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="story"
                onClick={() => setIsStoryViewerOpen(true)}
              >
                <div className="story-content">{story.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isStoryViewerOpen && (
        <StoryViewer
          stories={stories}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      )}
      {isCreatePostOpen && (
        <CreatePost
          onClose={() => setIsCreatePostOpen(false)}
          onStoryPosted={addStory}
        />
      )}

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