import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; // Make sure to create a corresponding CSS file

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h2>Login</h2>
          <button className="google-login">Sign in with Google</button>
          <hr />
          <input type="email" placeholder="Enter your email" className="input-field" />
          <input type="password" placeholder="Enter your password" className="input-field" />
          <p><Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link></p>
          <button className="login-button">LOGIN</button>
          <p>Don't have an account? <Link to="/register" className="register-link">Register Here</Link></p>
        </div>
        <div className="login-right"></div>
      </div>
    </div>
  );
}

export default Login;