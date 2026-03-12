import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/SignIn.css';

const IsometricGraphic = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Grid Base */}
        <path d="M200 280 L60 210 L200 140 L340 210 Z" fill="#C26A23" fillOpacity="0.2" stroke="#C26A23" strokeWidth="1" />
        <path d="M130 245 L270 175" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M270 245 L130 175" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M200 280 L200 140" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M60 210 L340 210" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />

        {/* Walls background lines (transparent) */}
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

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setIsSubmitting(true);
            await login({ email, password });
            const fromRoute = location.state?.from;
            navigate(fromRoute || '/admin/dashboard', { replace: true });
        } catch (requestError) {
            setError(requestError?.message || 'Sign in failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container sign-in-page">
            {/* Left Pane - Branding */}
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
                <div className="auth-form-container sign-in-container">
                    <div className="form-header">
                        <h2>Welcome back</h2>
                        <p>Please enter your details to access your workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="designer@furniplan.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-icon-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Toggle password visibility"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {showPassword ? (
                                            <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </>
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="form-actions-row">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember for 30 days</span>
                            </label>
                            <Link to="/admin/forgot-password" className="forgot-password-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>

                        {error && <p className="auth-error-message">{error}</p>}
                    </form>

                    <div className="form-footer">
                        Don't have an account? <Link to="/contact">Contact Admin</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
