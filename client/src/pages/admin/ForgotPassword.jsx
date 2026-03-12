import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/SignIn.css'; // Shared container styles
import '../../styles/ForgotPassword.css'; // Specific overrides

const IsometricGraphic = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Grid Base */}
        <path d="M200 280 L60 210 L200 140 L340 210 Z" fill="#C26A23" fillOpacity="0.2" stroke="#C26A23" strokeWidth="1" />
        <path d="M130 245 L270 175" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M270 245 L130 175" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M200 280 L200 140" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M60 210 L340 210" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />

        {/* Walls background lines */}
        <path d="M60 210 L60 100 L200 170 L200 280 Z" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M340 210 L340 100 L200 170 L200 280 Z" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />

        <path d="M60 100 L200 30" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M340 100 L200 30" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M200 170 L200 30" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />

        {/* The Core Box */}
        <g transform="translate(0, 15)">
            <path d="M200 230 L150 205 L200 180 L250 205 Z" fill="#9CA3AF" />
            <path d="M150 205 L150 165 L200 190 L200 230 Z" fill="#6B7280" />
            <path d="M250 205 L250 165 L200 190 L200 230 Z" fill="#4B5563" />

            {/* Box Flaps/Lid */}
            <path d="M200 190 L150 165 L175 152 L225 177 Z" fill="#F3F4F6" />
            <path d="M200 190 L250 165 L225 152 L175 177 Z" fill="#E5E7EB" />
        </g>
    </svg>
);

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setIsSubmitting(true);
            await forgotPassword(email);
            setSubmitted(true);
        } catch (requestError) {
            setError(requestError?.message || 'Failed to send reset link.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container forgot-password-page">
            {/* Left Pane - Branding (Same as SignIn) */}
            <div className="auth-branding">
                <div className="branding-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-logo">
                        <path d="M4 8h16M4 16h16M5 8v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" stroke="#D97736" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 4h6a2 2 0 0 1 2 2v2H7V6a2 2 0 0 1 2-2Z" stroke="#D97736" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="brand-name">FurniPlan</span>
                </div>

                <div className="branding-graphic">
                    <IsometricGraphic />
                </div>

                <div className="branding-text">
                    <h1>Visualize. Design.<br /><span>Deliver.</span></h1>
                    <p>The complete 2D and 3D environment toolkit<br />for modern retail consultations.</p>
                </div>
            </div>

            {/* Right Pane - Form */}
            <div className="auth-form-wrapper">
                <div className="auth-form-container forgot-password-container">

                    <Link to="/admin/signin" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Login
                    </Link>

                    <div className="icon-circle">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                        </svg>
                    </div>

                    <div className="form-header">
                        <h2>Reset Password</h2>
                        <p>Enter the email associated with your account and we'll send an email with instructions to reset your password.</p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="designer@furniplan.com"
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-btn forgot-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            {error && <p className="auth-error-message">{error}</p>}
                        </form>
                    ) : (
                        <div className="success-message">
                            <div className="success-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <p>Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.</p>
                        </div>
                    )}

                    <div className="form-footer">
                        Having trouble? <Link to="/contact">Contact IT Support</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
