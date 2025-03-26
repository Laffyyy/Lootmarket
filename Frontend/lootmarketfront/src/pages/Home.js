import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoryViewer from "../component/StoryViewer";
import CreatePost from "../component/CreatePost";
import "./Home.css";
import bannerImage from "lootmarketfront/public/banner.png";
import logo from "../assets/Images/logo.png"; // Corrected logo import
import CardProduct from "../component/cardproduct";
import EditProduct from "../component/editproduct"; // Import the EditProduct component
import axios from "axios";

const Home = () => {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0); // Add state to track the current story index
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const navigate = useNavigate();

  const generateVideoThumbnail = (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous"; // Allow cross-origin access for thumbnails
      video.muted = true; // Mute the video to allow autoplay
      video.playsInline = true; // Ensure it plays inline on mobile devices

      video.addEventListener("loadeddata", () => {
        video.currentTime = 0.5; // Seek to a frame near the start
      });

      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 60; // Thumbnail width
        canvas.height = 60; // Thumbnail height
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png")); // Return the thumbnail as a data URL
      });

      video.addEventListener("error", () => {
        console.warn(`Failed to load video for thumbnail: ${videoUrl}`);
        resolve(null); // Return null if thumbnail generation fails
      });
    });
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        console.log("Fetching all users' stories");
        const response = await axios.get("http://localhost:5000/stories/all"); // Adjusted endpoint to fetch all stories

        console.log("Fetched stories:", response.data.stories);

        const storiesWithThumbnails = await Promise.all(
          response.data.stories.map(async (story) => {
            const fileUrl = `http://localhost:5000${story.fileUrl}`;
            if (story.fileType === "video") {
              const thumbnail = await generateVideoThumbnail(fileUrl);
              return { ...story, fileUrl, thumbnail };
            }
            return { ...story, fileUrl };
          })
        );

        setStories(storiesWithThumbnails);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  const addStory = (newStory) => {
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
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <img src={logo} alt="LootMarket Logo" className="logo-img" /> {/* Correctly reference logo.png */}
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
            {stories.map((story, index) => {
              // Ensure the story object is valid and has the required properties
              if (!story || !story.fileUrl || !story.title) {
                console.warn(`Invalid story object at index ${index}:`, story);
                return null; // Skip rendering invalid stories
              }

              const fullFileUrl = story.fileUrl;
              const previewUrl = story.fileType === "video" ? story.thumbnail : fullFileUrl;

              return (
                <div
                  key={story.id}
                  className="story"
                  onClick={() => {
                    setCurrentStoryIndex(index); // Set the current story index
                    setIsStoryViewerOpen(true); // Open the StoryViewer
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div className="story-title"> {story.title}</div>
                  <img
                    src={previewUrl}
                    alt={story.title}
                    className="story-thumbnail" // Use the existing class for the image
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {isStoryViewerOpen && (
        <StoryViewer
          stories={stories}
          currentIndex={currentStoryIndex} // Pass the current story index
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
              <CardProduct key={product.id || product.name} product={product} /> // Ensure unique key
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