import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import $ from "jquery";
import "jquery.guillotine"; // Import jQuery Guillotine
import "./CreatePost.css";

if (typeof window !== "undefined") {
  window.jQuery = $; // Make jQuery globally available
  window.$ = $; // Assign to $ as well
}

const CreatePost = ({ onClose, onStoryPosted, simpleMode }) => {
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const guillotineRef = useRef(null); // Declare ref for the image

  // Initialize Guillotine when image is in edit mode
  useEffect(() => {
    if (isEditing && media?.type.startsWith("image/")) {
      const $image = $(guillotineRef.current);

      const initializeGuillotine = () => {
        if ($image.data("guillotine")) {
          $image.guillotine("remove"); // Remove previous instance
        }
        $image.guillotine({ width: 300, height: 300 });

        // Attach control buttons
        document.getElementById("rotate-left").onclick = () => $image.guillotine("rotateLeft");
        document.getElementById("rotate-right").onclick = () => $image.guillotine("rotateRight");
        document.getElementById("zoom-in").onclick = () => $image.guillotine("zoomIn");
        document.getElementById("zoom-out").onclick = () => $image.guillotine("zoomOut");
        document.getElementById("fit").onclick = () => $image.guillotine("fit");
        document.getElementById("center").onclick = () => $image.guillotine("center");
      };

      if (guillotineRef.current.complete) {
        initializeGuillotine();
      } else {
        $image.on("load", initializeGuillotine);
      }

      return () => {
        if ($image.data("guillotine")) {
          $image.guillotine("remove");
        }
        $image.off("load", initializeGuillotine);
      };
    }
  }, [isEditing, media]);

  const handleMediaChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src); // Free memory
        if (video.duration > 15) {
          alert("Video duration must not exceed 15 seconds.");
        } else {
          setMedia(file);
          setPreview(URL.createObjectURL(file));
        }
      };
    } else {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCancelUpload = () => {
    setMedia(null);
    setPreview(null);
    setIsEditing(false);

    // Reset the file input's value to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditImage = () => {
    setIsEditing(true);
  };

  const handleSaveImage = () => {
    if (media && media.type.startsWith("image/")) {
      const $image = $(guillotineRef.current);
      const data = $image.guillotine("getData");

      const img = new Image();
      img.src = preview;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = data.w;
        canvas.height = data.h;
        ctx.drawImage(img, data.x, data.y, data.w, data.h, 0, 0, data.w, data.h);

        const croppedDataURL = canvas.toDataURL("image/png");
        setPreview(croppedDataURL);
        setIsEditing(false);
      };
    }
  };

  const handleTrimVideo = () => {
    alert("Video trimming functionality will be implemented here.");
    // Add video trimming logic using a library like ffmpeg.js
  };

  const handlePost = async () => {
    if (!media || !title) {
      alert("Please upload media and enter a title");
      return;
    }
  
    const formData = new FormData();
  
    if (media.type.startsWith("image/") && isEditing) {
      // Handle cropped image
      const $image = $(guillotineRef.current);
      const data = $image.guillotine("getData");
  
      const img = new Image();
      img.src = preview;
  
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
  
          canvas.width = data.w;
          canvas.height = data.h;
          ctx.drawImage(img, data.x, data.y, data.w, data.h, 0, 0, data.w, data.h);
  
          canvas.toBlob((blob) => {
            formData.append("media", blob, "cropped-image.png"); // Append cropped image as Blob
            resolve();
          }, "image/png");
        };
      });
    } else {
      // Append original media
      formData.append("media", media);
    }
  
    formData.append("title", title);
    formData.append("caption", caption);
  
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not logged in. Please log in first.");
        return;
      }
  
      const response = await axios.post("http://localhost:5000/stories", formData, {
        headers: {
          "user-id": userId,
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert(response.data.message);
      onStoryPosted(response.data.story);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to post story");
    }
  };
  

  return (
    <div className="create-post-overlay">
      <div className="create-post-container">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{simpleMode ? "Post a Story" : "Create a Story"}</h2>

        <div className="media-upload">
          {preview ? (
            <div className="uploaded-media-container">
              <button className="cancel-button" onClick={handleCancelUpload}>x</button>
              {preview && media.type.startsWith("image/") ? (
                isEditing ? (
                  <div className="edit-container">
                    <img ref={guillotineRef} src={preview} alt="Editable Preview" className="image-preview" />
                    <div className="guillotine-container"/> 
                    {/* Guillotine Controls */}
                    <div className="guillotine-controls">
                      <button id="rotate-left">↺ Rotate Left</button>
                      <button id="rotate-right">↻ Rotate Right</button>
                      <button id="zoom-in">🔍➕ Zoom In</button>
                      <button id="zoom-out">🔍➖ Zoom Out</button>
                      <button id="fit">Fit</button>
                      <button id="center">Center</button>
                    </div>

                    <button className="save-button" onClick={handleSaveImage}>Save</button>
                  </div>  
               
                ) : (
                  <img src={preview} alt="Preview" className="image-preview" />
                )
              ) : null}

              {!isEditing && media.type.startsWith("image/") && !simpleMode && (
                <button className="edit-button" onClick={handleEditImage}>
                  Edit
                </button>
              )}
              {media.type.startsWith("video/") && !simpleMode && (
                <button className="trim-button" onClick={handleTrimVideo}>
                  Trim
                </button>
              )}
            </div>
          ) : (
            <label htmlFor="mediaInput" className="upload-box">
              <div className="camera-icon">
                <img src="/camera.png" alt="Camera Icon" className="camera-image" />
              </div>
              <p className="upload-title">Upload a photo or video</p>
              <p className="upload-subtext">Share a moment from your day with your connections</p>
              <button className="upload-button" type="button" onClick={() => fileInputRef.current.click()}>
                Select from device
              </button>
            </label>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleMediaChange}
            hidden
          />
        </div>

        {/* Hide everything below this point when editing */}
        {!isEditing && (
          <>
            <div className="input-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Enter story title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Caption</label>
              <textarea
                placeholder="Write something about this story..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <button className="post-button" onClick={handlePost}>Post Story</button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
