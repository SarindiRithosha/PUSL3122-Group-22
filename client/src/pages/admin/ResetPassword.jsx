import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/SignIn.css";
import "../../styles/ForgotPassword.css";

const IsometricGraphic = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M200 280 L60 210 L200 140 L340 210 Z" fill="#C26A23" fillOpacity="0.2" stroke="#C26A23" strokeWidth="1" />
    <path d="M130 245 L270 175" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M270 245 L130 175" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M200 280 L200 140" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M60 210 L340 210" stroke="#C26A23" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M60 210 L60 100 L200 170 L200 280 Z" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
    <path d="M340 210 L340 100 L200 170 L200 280 Z" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
    <path d="M60 100 L200 30" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
    <path d="M340 100 L200 30" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
    <path d="M200 170 L200 30" fill="none" stroke="#6b4c37" strokeWidth="1.5" strokeOpacity="0.3" />
    <g transform="translate(0, 15)">
      <path d="M200 230 L150 205 L200 180 L250 205 Z" fill="#9CA3AF" />
      <path d="M150 205 L150 165 L200 190 L200 230 Z" fill="#6B7280" />
      <path d="M250 205 L250 165 L200 190 L200 230 Z" fill="#4B5563" />
      <path d="M200 190 L150 165 L175 152 L225 177 Z" fill="#F3F4F6" />
      <path d="M200 190 L250 165 L225 152 L175 177 Z" fill="#E5E7EB" />
    </g>
  </svg>
);

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const token = searchParams.get("token") || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword({ token, password, confirmPassword });
      setIsSubmitted(true);
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container forgot-password-page reset-password-page">
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
          <h1>
            Reset. Protect.
            <br />
            <span>Resume.</span>
          </h1>
          <p>Set a new admin password and continue working securely in your dashboard.</p>
        </div>
      </div>

      <div className="auth-form-wrapper">
        <div className="auth-form-container forgot-password-container reset-password-container">
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
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          <div className="form-header">
            <h2>Set New Password</h2>
            <p>Choose a strong password with at least 8 characters to secure your admin account.</p>
          </div>

          {isSubmitted ? (
            <div className="success-message">
              <p>Password updated successfully. You can sign in now.</p>
              <Link to="/admin/signin" className="forgot-password-link">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  minLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="********"
                  minLength={8}
                  required
                />
              </div>

              {error && <p className="auth-error-message">{error}</p>}

              <button
                type="submit"
                className="submit-btn forgot-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <div className="form-footer">
            Need help? <Link to="/contact">Contact IT Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
