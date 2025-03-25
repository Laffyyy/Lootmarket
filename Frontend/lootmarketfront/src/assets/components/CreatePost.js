import React, { useState } from "react";
import "./CreatePost.css";

const CreatePost = ({ onClose, onStoryPosted }) => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  console.log(isEditing);


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = () => {
    if (!image || !title || !caption) {
      alert("Please upload an image, enter a title, and add a caption.");
      return;
    }

    const newStory = {
      id: Date.now(),
      title,
      caption,
      image: preview,
    };

    onStoryPosted(newStory);
    alert("Story uploaded successfully!");
    onClose();
  };

  const triggerFileUpload = () => {
    document.getElementById("imageInput").click();
  };

  const handleEditImage = () => {
    setIsEditing(true);
  };

  const handleCancelUpload = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="create-post-overlay">
      <div className="create-post-container">
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Create a Story</h2>

        {/* Image Upload Section */}
        <div className="image-upload">
          {preview ? (
            <div className="uploaded-image-container">
              <button className="edit-button" onClick={handleEditImage}>Edit</button>
              <button className="cancel-button" onClick={handleCancelUpload}>x</button>
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          ) : (
            <label htmlFor="imageInput" className="upload-box">
              <div className="camera-icon">
                <img src="/camera.png" alt="Camera Icon" className="camera-image" />
              </div>
              <p className="upload-title">Upload a photo or video</p>
              <p className="upload-subtext">Share a moment from your day with your connections</p>
              <button className="upload-button" type="button" onClick={triggerFileUpload}>
                Select from device
              </button>
            </label>
          )}
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </div>

        {/* Title & Caption */}
        <div className="input-group">
          <label>Title</label>
          <input type="text" placeholder="Enter story title..." value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Caption</label>
          <textarea placeholder="Write something about this story..." value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>

        {/* Post Button */}
        <button className="post-button" onClick={handlePost}>Post Story</button>
      </div>
    </div>
  );
};

export default CreatePost;
