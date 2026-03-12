import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import "../styles/CustomerSignIn.css";

const CustomerResetPassword = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const { resetCustomerPassword } = useCustomerAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resetToken) {
      setError("Reset token is missing. Use the reset link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await resetCustomerPassword({ token: resetToken, password, confirmPassword });
      setSuccess(true);
    } catch (requestError) {
      setError(requestError?.message || "Password reset failed. Try again.");
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
              <h2>Set a New Password</h2>
              <p>Choose a strong password to secure your FurniPlan customer account.</p>
            </div>
          </div>
        </div>

        <div className="signin-form-pane">
          <div className="form-pane-content">
            <div className="mobile-logo">FurniPlan</div>

            <div className="form-header">
              <h1>Reset Password</h1>
              <p>Enter and confirm your new password.</p>
            </div>

            {success ? (
              <div className="success-panel">
                <p>Password updated successfully. You can sign in now.</p>
                <Link className="primary-signin-btn success-link-btn" to="/sign-in">
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="customer-auth-form">
                <div className="input-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your new password"
                    minLength={8}
                    required
                  />
                </div>

                {error ? <p className="inline-feedback">{error}</p> : null}

                <button type="submit" className="primary-signin-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerResetPassword;

