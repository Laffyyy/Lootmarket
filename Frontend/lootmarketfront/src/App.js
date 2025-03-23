import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Register from './pages/register';
import VerifyEmail from './pages/verifyemail';

function App() {
  return (
    <div className="main-container">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />
      </Routes>
    </div>
  );
}

export default App;