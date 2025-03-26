import React, { useState, useEffect } from "react";
import "./StoryViewer.css";

const StoryViewer = ({ stories, currentIndex = 0, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(currentIndex);

  useEffect(() => {
    setCurrentStoryIndex(currentIndex);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentStoryIndex((prevIndex) => (prevIndex + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentStoryIndex((prevIndex) => (prevIndex - 1 + stories.length) % stories.length);
  };

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-container">
        <button className="close-button" onClick={onClose}>
          Close
        </button>
        {stories.length > 0 && (
          <>
            <h3 className="story-title">{stories[currentStoryIndex].title}</h3>
            {stories[currentStoryIndex].fileType === "video" ? (
              <video
                src={stories[currentStoryIndex].fileUrl}
                controls
                autoPlay
                muted
                playsInline
                className="story-image"
                onError={(e) => console.error("Video failed to load:", e.target.error)}
                onLoadedData={() => console.log("Video loaded successfully")}
              />
            ) : (
              <img
                src={stories[currentStoryIndex].fileUrl}
                alt={stories[currentStoryIndex].title}
                className="story-image"
              />
            )}
            <p>{stories[currentStoryIndex].caption}</p>
            <button className="nav-button left" onClick={handlePrev}>
              &#8249;
            </button>
            <button className="nav-button right" onClick={handleNext}>
              &#8250;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
