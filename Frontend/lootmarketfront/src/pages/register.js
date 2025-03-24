import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './register.css'; // Import the CSS file
import logo from '../assets/logo.png'; // Import your logo

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post('http://localhost:5000/auth/register', { email, password });
      alert('OTP sent to your email');
      navigate('/verifyemail');
    } catch (error) {
      alert('Error registering user: ' + (error.response ? error.response.data : error.message));
    }
  };
  

  return (
    <div className="register-container">
      <div className="register-box">
        {/* Left Side - Blue with Logo */}
        <div className="register-left">
          <img src={logo} alt="Logo" className="register-logo" />
        </div>

        {/* Right Side - Register Form */}
        <div className="register-right">
          <h2>Register</h2>
          <button className="google-register">Sign in with Google</button>
          <hr />
          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="register-button">Register</button>
          </form>
          <p>Already have an account? <Link to="/">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
