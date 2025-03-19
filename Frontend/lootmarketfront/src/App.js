import React, { useState } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom'; // Remove Router import
import './App.css';
import Register from './pages/register';
import VerifyEmail from './pages/verifyemail'; // Ensure VerifyEmail is a default export

function App() {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/login', { // Ensure this URL matches the backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        setLoginMessage('Login successful!');
      } else if (response.status === 403) {
        setLoginMessage('Email not verified. OTP has been resent to your email.');
        navigate('/verifyemail'); // Redirect to VerifyEmail page
      } else {
        setLoginMessage(data.message);
      }
    } catch (error) {
      setLoginMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="main-container">
      <Routes>
        <Route exact path="/" element={
          <>
            <h1>Loot Market</h1>
            <p>Buy and sell your favorite in-game items</p>
            <form onSubmit={handleLoginSubmit}>
              <p>Login</p>
              <input
                type="text"
                name="email"
                placeholder="example@gmail.com"
                value={loginData.email}
                onChange={handleLoginChange}
              />
              <input
                type="password"
                name="password"
                placeholder="password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
              <button type="submit">Login</button>
            </form>
            {loginMessage && <p>{loginMessage}</p>}
            <Link to="/register">Don't have an account? Register here</Link>
          </>
        } />
        <Route path="/register" element={<Register />} />
        <Route path="/verifyemail" element={<VerifyEmail />} /> {/* Add VerifyEmail route */}
      </Routes>
    </div>
  );
}

export default App;