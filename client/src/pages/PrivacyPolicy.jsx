import React from "react";
import "../styles/PrivacyPolicy.css";
import { FaDatabase, FaUserShield, FaLock, FaUserCheck, FaSyncAlt, FaEnvelope } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">

      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="privacy-hero-container">

          <span className="privacy-tag">Legal</span>

          <h1 className="privacy-title">
            Privacy <span className="privacy-accent">Policy</span>
          </h1>

          <p className="privacy-description">
            FurniPlan values your privacy and is committed to protecting your
            personal information. This policy explains how we collect, use,
            and protect your data when using our platform.
          </p>

          <span className="privacy-update">
            Last updated: March 2026
          </span>

        </div>
      </section>


      {/* Privacy Content */}
      <section className="privacy-section">

        <div className="privacy-container">

          <div className="policy-card">
            <div className="policy-icon"><FaDatabase /></div>
            <h2>Information We Collect</h2>
            <p>
              We may collect personal information such as your name, email
              address, and account information when you register or use
              FurniPlan services. We also collect usage data to improve the
              functionality and performance of the platform.
            </p>
          </div>

          <div className="policy-card">
            <div className="policy-icon"><FaUserShield /></div>
            <h2>How We Use Your Information</h2>
            <p>
              The collected information helps us improve the user experience,
              personalize features, provide customer support, and deliver
              important service updates.
            </p>
          </div>

          <div className="policy-card">
            <div className="policy-icon"><FaLock /></div>
            <h2>Data Protection</h2>
            <p>
              We implement strong security measures to protect your data from
              unauthorized access, disclosure, or loss.
            </p>
          </div>

          <div className="policy-card">
            <div className="policy-icon"><FaUserCheck /></div>
            <h2>Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal
              information. If you need help managing your data, please contact
              our support team.
            </p>
          </div>

          <div className="policy-card">
            <div className="policy-icon"><FaSyncAlt /></div>
            <h2>Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in services, legal requirements, or technology updates.
            </p>
          </div>

          <div className="policy-card">
            <div className="policy-icon"><FaEnvelope /></div>
            <h2>Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy,
              please contact the FurniPlan support team.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
};

export default PrivacyPolicy;