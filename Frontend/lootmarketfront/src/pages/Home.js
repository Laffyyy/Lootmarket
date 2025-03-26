import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import bannerImage from "lootmarketfront/public/banner.png";
import CardProduct from "../component/cardproduct";
import EditProduct from "../component/editproduct"; // Import the EditProduct component

const Home = () => {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const navigate = useNavigate();

  const addStory = () => {
    const newStory = { id: stories.length + 1, content: `Story ${stories.length + 1}` };
    setStories([...stories, newStory]);
  };

  const handleAddProduct = async (newProduct) => {
    try {
      const userId = localStorage.getItem('userId'); // Ensure this is set in localStorage
      if (!userId) {
        throw new Error('User ID is missing. Please log in.');
      }

      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('image', newProduct.image); // Ensure this is a File object

      const response = await fetch('http://localhost:5000/product/add', {
        method: 'POST',
        headers: {
          'user-id': userId, // Pass user ID in headers
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      const result = await response.json();
      setProducts([...products, { id: result.productId, ...newProduct }]);
      setShowPopup(false); // Close the popup after adding the product
    } catch (error) {
      console.error('Error adding product:', error.message);
      alert(error.message); // Show error to the user
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/product/list-all', {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch products');
        }

        const result = await response.json();
        setProducts(result.products); // Update the products state with fetched data
      } catch (error) {
        console.error('Error fetching products:', error.message);
        alert(error.message); // Show error to the user
      }
    };

    fetchProducts();
  }, []); // Run only once when the component mounts

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
              <CardProduct key={product.id} product={product} /> // Add the key prop
            ))}
          </div>
        </div>
      </div>
      <button className="add-product-button" onClick={() => setShowPopup(true)}>
        + Add Product
      </button>
      {showPopup && (
        <EditProduct
          onClose={() => setShowPopup(false)}
          onSave={handleAddProduct}
        />
      )}
    </div>
  );
};

export default Home;