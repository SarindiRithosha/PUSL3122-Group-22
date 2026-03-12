import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import "../styles/CustomerSignIn.css";

const CustomerForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { forgotCustomerPassword } = useCustomerAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setIsSubmitting(true);
      await forgotCustomerPassword(email);
      setIsSent(true);
    } catch (requestError) {
      setError(requestError?.message || "Failed to send reset link. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-signin-page">
      <Link to="/" className="back-home-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back to Home</span>
      </Link>

      <div className="signin-card">
        <div className="signin-image-pane">
          <div className="image-overlay">
            <div className="overlay-content">
              <h2>Recover Your Account Access</h2>
              <p>Enter your email and we will send reset instructions so you can securely sign in again.</p>
            </div>
          </div>
        </div>

        <div className="signin-form-pane">
          <div className="form-pane-content">
            <div className="mobile-logo">FurniPlan</div>

            <div className="form-header">
              <h1>Forgot Password</h1>
              <p>Use your registered email address to receive a reset link.</p>
            </div>

            {isSent ? (
              <div className="success-panel">
                <p>Reset link sent. Check your inbox and follow the instructions.</p>
                <Link className="primary-signin-btn success-link-btn" to="/sign-in">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="customer-auth-form">
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button type="submit" className="primary-signin-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            {error ? <p className="inline-feedback">{error}</p> : null}

            <div className="signup-prompt">
              Remembered your password? <Link to="/sign-in">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForgotPassword;
