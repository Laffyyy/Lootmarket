import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import './register.css'; // Import the CSS file
import logo from '../assets/Images/logo.png'; // Corrected the path to the logo file

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Extract email from query parameters if available
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        navigator('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred while verifying the email');
    }
  };
  return (
    <div className="register-container">
      <div className="register-box">
        {/* Left Side - Blue with Logo */}
        <div className="register-left">
          <img src={logo} alt="Logo" className="register-logo" />
        </div>

        {/* Right Side - Verify Email Form */}
        <div className="register-right">
          <h2>Verify Your Email</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!email} // Make the field read-only if pre-filled
              placeholder="Enter your email"
            />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter your OTP"
            />
            <button type="submit" className="register-button">Verify</button>
          </form>
          {message && <p style={{ color: 'green' }}>{message}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
