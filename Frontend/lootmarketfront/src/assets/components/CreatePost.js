import React, { useState } from "react";
import axios from "axios";

const CreatePost = ({ onClose, onStoryPosted }) => {
  const [storyTitle, setStoryTitle] = useState("");
  const [storyCaption, setStoryCaption] = useState("");
  const [storyImage, setStoryImage] = useState(null);

  const handleStorySubmit = async () => {
    if (!storyTitle || !storyImage) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", storyTitle);
    formData.append("caption", storyCaption); // Caption can be empty
    formData.append("picture", storyImage);

    try {
      const userId = localStorage.getItem("userId"); // Retrieve user ID from local storage
      if (!userId) {
        alert("User not logged in. Please log in first.");
        return;
      }

      const response = await axios.post("http://localhost:5000/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "user-id": userId,
        },
      });

      alert(response.data.message);
      onStoryPosted({
        id: Date.now(),
        title: storyTitle,
        caption: storyCaption,
        pictureUrl: URL.createObjectURL(storyImage),
      }); // Notify parent of the new story
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error posting story:", error);
      alert("Failed to post story.");
    }
  };

  const modalStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyles = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };

  const inputStyles = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const buttonContainerStyles = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  };

  const buttonStyles = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const postButtonStyles = {
    ...buttonStyles,
    backgroundColor: "#4CAF50",
    color: "#fff",
  };

  const cancelButtonStyles = {
    ...buttonStyles,
    backgroundColor: "#f44336",
    color: "#fff",
  };

  return (
    <div style={modalStyles}>
      <div style={modalContentStyles}>
        <h3>Add a Story</h3>
        <input
          type="text"
          placeholder="Story Title"
          value={storyTitle}
          onChange={(e) => setStoryTitle(e.target.value)}
          style={inputStyles}
        />
        <textarea
          placeholder="Story Caption"
          value={storyCaption}
          onChange={(e) => setStoryCaption(e.target.value)}
          style={{ ...inputStyles, height: "80px" }}
        ></textarea>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setStoryImage(e.target.files[0])}
          style={inputStyles}
        />
        <div style={buttonContainerStyles}>
          <button onClick={handleStorySubmit} style={postButtonStyles}>
            Post Story
          </button>
          <button onClick={onClose} style={cancelButtonStyles}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
