import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function Login() {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        setLoginMessage('Login successful!');
        localStorage.setItem('userId', data.user.uid);
        navigate('/home');
      } else if (response.status === 403) {
        setLoginMessage('Email not verified. OTP has been resent to your email.');
        navigate(`/verifyemail?email=${encodeURIComponent(loginData.email)}`);
      } else {
        setLoginMessage(data.message);
      }
    } catch (error) {
      setLoginMessage('An error occurred. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setLoginMessage('Google login failed: No ID token received.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/google-signin', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response from server:', errorText);
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
      }
      const data = await res.json();
      setLoginMessage(`Google login successful! Welcome, ${data.user.name}`);
      localStorage.setItem('userId', data.user.uid);
      navigate('/home');
    } catch (error) {
      console.error('Error during Google login:', error);
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
    <GoogleOAuthProvider clientId="176878939053-tb4n8t6390jrhvks67pkhoek9usn4pu7.apps.googleusercontent.com"> {/* Replace with your Google Client ID */}
      <div className="login-container">
        <div className="login-box">
          <div className="login-left">
            <img src="/logo.png" alt="Logo" className="logo" />
            <h2>Login</h2>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
            <hr />
            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="input-field"
                value={loginData.email}
                onChange={handleLoginChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="input-field"
                value={loginData.password}
                onChange={handleLoginChange}
              />
              <p>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </p>
              <button type="submit" className="login-button">LOGIN</button>
            </form>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="register-link">
                Register Here
              </Link>
            </p>
            {loginMessage && <p className="login-message">{loginMessage}</p>}
          </div>
          <div className="login-right"></div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;