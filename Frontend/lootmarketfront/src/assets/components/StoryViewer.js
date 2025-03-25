import React, { useState, useEffect } from "react";

const StoryViewer = ({ onClose }) => {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId"); // Retrieve user ID from local storage
    if (!userId) {
      console.error("User not logged in. Please log in first.");
      return;
    }

    fetch(`http://localhost:5000/stories`, {
      headers: { "user-id": userId },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch stories");
        }
        return response.json();
      })
      .then((data) => {
        const updatedStories = data.stories.map((story) => ({
          ...story,
          pictureUrl: story.pictureUrl.startsWith("http")
            ? story.pictureUrl
            : `http://localhost:5000${story.pictureUrl}`, // Ensure full URL
        }));
        setStories(updatedStories);
      })
      .catch((error) => console.error("Error fetching stories:", error));
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + stories.length) % stories.length);
  };

  const modalStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const contentStyles = {
    position: "relative",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "80%",
    maxWidth: "600px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const imageStyles = {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  };

  const buttonStyles = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
  };

  const prevButtonStyles = {
    ...buttonStyles,
    left: "10px",
  };

  const nextButtonStyles = {
    ...buttonStyles,
    right: "10px",
  };

  const closeButtonStyles = {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
  };

  return (
    <div style={modalStyles}>
      <div style={contentStyles}>
        <button onClick={onClose} style={closeButtonStyles}>
          Close
        </button>
        {stories.length > 0 && (
          <>
            <img
              src={stories[currentIndex].pictureUrl}
              alt={stories[currentIndex].title}
              style={imageStyles}
            />
            <h3>{stories[currentIndex].title}</h3>
            <p>{stories[currentIndex].caption}</p>
            <button onClick={handlePrev} style={prevButtonStyles}>
              &#8249;
            </button>
            <button onClick={handleNext} style={nextButtonStyles}>
              &#8250;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
