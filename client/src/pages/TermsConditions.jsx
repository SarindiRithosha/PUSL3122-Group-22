import React from "react";
import "../styles/TermsConditions.css";
import {
  FaFileContract,
  FaUserCheck,
  FaTools,
  FaCopyright,
  FaExclamationTriangle,
  FaSyncAlt,
  FaEnvelope
} from "react-icons/fa";

const TermsConditions = () => {
  return (
    <div className="terms-page">

      {/* Hero Section */}
      <section className="terms-hero">
        <div className="terms-hero-container">

          <span className="terms-tag">Legal</span>

          <h1 className="terms-title">
            Terms & <span className="terms-accent">Conditions</span>
          </h1>

          <p className="terms-description">
            These Terms and Conditions outline the rules and regulations
            for using the FurniPlan platform. By accessing our services,
            you agree to comply with these terms.
          </p>

          <span className="terms-update">
            Last updated: March 2026
          </span>

        </div>
      </section>

      {/* Terms Cards */}
      <section className="terms-section">
        <div className="terms-container">

          <div className="terms-card">
            <div className="terms-icon"><FaFileContract /></div>
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using FurniPlan, you agree to comply with
              these Terms and Conditions. If you do not agree with any
              part of these terms, you should not use our platform.
            </p>
          </div>

          <div className="terms-card">
            <div className="terms-icon"><FaTools /></div>
            <h2>Use of the Platform</h2>
            <p>
              FurniPlan provides tools to design and plan furniture layouts
              using 3D visualization. Users must use the platform responsibly
              and must not misuse the system.
            </p>
          </div>

          <div className="terms-card">
            <div className="terms-icon"><FaUserCheck /></div>
            <h2>User Accounts</h2>
            <p>
              Users are responsible for maintaining the confidentiality of
              their account credentials and for all activities conducted
              under their account.
            </p>
          </div>

          <div className="terms-card">
            <div className="terms-icon"><FaCopyright /></div>
            <h2>Intellectual Property</h2>
            <p>
              All FurniPlan content including design elements, graphics,
              and software are protected by copyright and intellectual
              property laws.
            </p>
          </div>

          <div className="terms-card">
            <div className="terms-icon"><FaExclamationTriangle /></div>
            <h2>Limitation of Liability</h2>
            <p>
              FurniPlan is provided "as-is". We are not responsible for
              damages arising from the use or inability to use the platform.
            </p>
          </div>

          <div className="terms-card">
            <div className="terms-icon"><FaSyncAlt /></div>
            <h2>Changes to Terms</h2>
            <p>
              We may update these Terms periodically to reflect changes
              in services, technology, or legal requirements.
            </p>
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section className="terms-contact">
        <div className="terms-contact-container">

          <div className="contact-icon">
            <FaEnvelope />
          </div>

          <h2>Need Help?</h2>

          <p>
            If you have any questions regarding these Terms and Conditions,
            please contact the FurniPlan support team.
          </p>

        </div>
      </section>

    </div>
  );
};

export default TermsConditions;