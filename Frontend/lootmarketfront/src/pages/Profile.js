import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css"; // Import Profile-specific styles

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "John Doe",
    age: 25,
    email: "johndoe@example.com",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Profile updated successfully!");
    navigate("/");
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <div className="logo-img"></div>
          <div className="logo-text">LootMarket</div>
        </div>
        <div className="nav-icons">
          <button className="back-button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </nav>

      {/* Profile Form */}
      <div className="profile-container">
        <h2>Edit Profile</h2>
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>Name:</label>
          <input type="text" name="name" value={user.name} onChange={handleChange} required />

          <label>Age:</label>
          <input type="number" name="age" value={user.age} onChange={handleChange} required />

          <label>Email:</label>
          <input type="email" name="email" value={user.email} onChange={handleChange} required />

          <label>Password:</label>
          <input type="password" name="password" value={user.password} onChange={handleChange} required />

          <label>Confirm Password:</label>
          <input type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} required />

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
