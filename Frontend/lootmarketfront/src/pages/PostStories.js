import React, { useState } from 'react';
import axios from 'axios';

const PostStories = () => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [picture, setPicture] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem('userId'); // Retrieve user ID from local storage
      if (!userId) {
        setMessage('User not logged in. Please log in first.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('caption', caption);
      formData.append('picture', picture);

      const response = await axios.post('http://localhost:5000/stories', formData, {
        headers: {
          'user-id': userId,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);
      setTitle('');
      setCaption('');
      setPicture(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to post story');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Post a Story</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="caption">Caption:</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            rows="4"
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="picture">Picture:</label>
          <input
            type="file"
            id="picture"
            accept="image/*"
            onChange={(e) => setPicture(e.target.files[0])}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Post Story
        </button>
      </form>
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
};

export default PostStories;
