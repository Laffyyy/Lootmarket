import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import './Login.css'; // Reuse the CSS from login.js

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Reset Password

    const requestOtp = async () => {
        try {
            await axios.post(
                'http://localhost:5000/forgotpass/request-otp',
                { email },
                { headers: { 'Content-Type': 'application/json' } } // Ensure JSON format
            );
            alert('OTP sent to your email.');
            setStep(2);
        } catch (error) {
            console.error('Error requesting OTP:', error);
            alert(error.response?.data?.error || 'Failed to send OTP. Please try again.');
        }
    };

    const resetPassword = async () => {
        try {
            await axios.post(
                'http://localhost:5000/forgotpass/reset-password',
                { email, otp, newPassword },
                { headers: { 'Content-Type': 'application/json' } } // Ensure JSON format
            );
            alert('Password reset successfully.');
            setStep(1);
            setEmail('');
            setOtp('');
            setNewPassword('');
        } catch (error) {
            console.error('Error resetting password:', error);
            alert(error.response?.data?.error || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-left">
                    <img src="/logo.png" alt="Logo" className="logo" />
                    <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
                    {step === 1 && (
                        <div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button onClick={requestOtp} className="login-button">Request OTP</button>
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                className="input-field"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="input-field"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button onClick={resetPassword} className="login-button">Reset Password</button>
                        </div>
                    )}
                    <p>
                        <Link to="/" className="forgot-password-link">
                            Signin
                        </Link>
                    </p>
                </div>
                <div className="login-right"></div>
            </div>
        </div>
    );
};

export default ForgotPassword;
