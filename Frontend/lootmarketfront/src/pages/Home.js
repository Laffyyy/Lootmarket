import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StoryViewer from "../assets/components/StoryViewer";
import CreatePost from "../assets/components/CreatePost";
import "./Home.css";
import bannerImage from "lootmarketfront/public/banner.png";
import logo from "../assets/Images/logo.png"; // Updated path for logo.png
import axios from "axios";

const Home = () => {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0); // Add state to track the current story index
  const navigate = useNavigate();

  const generateVideoThumbnail = (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous"; // Allow cross-origin access for thumbnails
      video.addEventListener("loadeddata", () => {
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
        const userId = localStorage.getItem("userId"); // Retrieve user ID from local storage
        if (!userId) {
          alert("User not logged in. Please log in first.");
          return;
        }

        console.log(`Fetching stories for userId: ${userId}`);
        const response = await axios.get("http://localhost:5000/stories", {
          headers: { "user-id": userId },
        });

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
          <img src="" alt="LootMarket Logo" className="logo-img" /> {/* Correctly reference logo.png */}
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
                  <img
                    src={previewUrl}
                    alt={story.title}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "5px",
                    }}
                  />
                  <div
                    className="story-content"
                    style={{
                      fontSize: "12px",
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "60px",
                    }}
                  >
                    {story.title}
                  </div>
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