import React, { useState } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Import from @react-oauth/google
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
      const response = await fetch('http://localhost:5000/login', { // Ensure this URL matches the backend
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

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential; // Extract ID token
    if (!idToken) {
      setLoginMessage('Google login failed: No ID token received.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/google-signin', { // Ensure this matches the backend port
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`, // Send ID token in Authorization header
        },
      });
      if (!res.ok) {
        const errorText = await res.text(); // Read response as text
        console.error('Error response from server:', errorText); // Log the error for debugging
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      const data = await res.json();
      setLoginMessage(`Google login successful! Welcome, ${data.user.name}`);
    } catch (error) {
      console.error('Error during Google login:', error); // Log the error for debugging
      if (error.message.includes('Cannot GET /google-signin')) {
        setLoginMessage('Google login failed: Backend route not found. Please check the server setup.');
      } else if (error.message.includes('Invalid token provided')) {
        setLoginMessage('Google login failed: Invalid token. Please ensure you are using the correct account.');
      } else if (error.message.includes('Failed to fetch')) {
        setLoginMessage('Failed to connect to the server. Please try again later.');
      } else {
        setLoginMessage('An error occurred during Google login.');
      }
    }
  };

  const handleGoogleFailure = () => {
    setLoginMessage('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId="176878939053-tb4n8t6390jrhvks67pkhoek9usn4pu7.apps.googleusercontent.com"> {/* Ensure this matches the Client ID in Google Cloud Console */}
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
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
              />
              {loginMessage && <p>{loginMessage}</p>}
              <Link to="/register">Don't have an account? Register here</Link>
            </>
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/verifyemail" element={<VerifyEmail />} /> {/* Add VerifyEmail route */}
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;