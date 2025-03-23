import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handlePostStoriesClick = () => {
    navigate('/post-stories'); // Navigate to Post Stories page
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Welcome to the Dashboard</h1>
      <p>Here you can manage your activities.</p>
      <button
        onClick={handlePostStoriesClick}
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        Go to Post Stories
      </button>
    </div>
  );
};

export default Dashboard;
