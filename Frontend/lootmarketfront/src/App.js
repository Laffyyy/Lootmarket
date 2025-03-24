import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Import from @react-oauth/google
import './App.css';
import Login from './pages/login';
import Register from './pages/register';
import VerifyEmail from './pages/verifyemail';
import Home from './pages/Home'; // Import the Home component
import Profile from './pages/Profile';

function App() {
  return (
   
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verifyemail" element={<VerifyEmail />} />
          <Route path="/home" element={<Home />} />
          <Route path="/Profile" element={<Profile />} />
        </Routes>
      </div>
  );
}

export default App;