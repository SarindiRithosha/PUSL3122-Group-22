import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/About.css";

import aboutHero from "/images/about-hero.png";
import missionImg from "/images/mission.jpg";
import plannerImg from "/images/planner.jpg";
import teamImg from "/images/team.jpg";

import { FaCouch } from "react-icons/fa";
import { FaBullseye } from "react-icons/fa";
import { FaDraftingCompass } from "react-icons/fa";

const About = () => {

  const navigate = useNavigate();

  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-container">

          <div className="about-hero-text">
            <span className="about-tag">About FurniPlan</span>

            <h1 className="about-title">
              Design Your Space with
              <span className="about-accent"> 3D Furniture Planning</span>
            </h1>

            <p className="about-description">
              FurniPlan is a modern 3D room planning platform that helps users
              visualize and organize furniture layouts before arranging their
              real living spaces. Our goal is to simplify interior design and
              allow anyone to create beautiful and functional room layouts
              easily.
            </p>
          </div>

          <div className="about-hero-image">
            <img src={aboutHero} alt="3D Furniture Planning" />
          </div>

        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-container">

          <div className="about-image">
            <img src={missionImg} alt="Our Mission" />
          </div>

          <div className="about-content">
            <h2>Our Mission</h2>

            <p>
              Our mission is to make interior design accessible to everyone.
              FurniPlan allows users to experiment with furniture arrangements
              digitally so they can make better decisions before purchasing or
              rearranging furniture in real life.
            </p>

            <p>
              By combining modern technology with simple design tools, we help
              users create comfortable, functional, and visually appealing
              spaces effortlessly.
            </p>

          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">

        <h2 className="section-title">Why Choose FurniPlan</h2>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">
              <FaCouch />
            </div>

            <h3>3D Visualization</h3>

            <p>
              View your room layout in a realistic 3D environment to understand
              how furniture will look in your space.
            </p>

          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaBullseye />
            </div>

            <h3>Easy Planning</h3>

            <p>
              Drag, move, rotate, and arrange furniture easily using our simple
              planning tools.
            </p>

          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaDraftingCompass />
            </div>

            <h3>Smart Layout</h3>

            <p>
              Experiment with different layouts to maximize space efficiency
              and improve room functionality.
            </p>

          </div>

        </div>

      </section>

      {/* Planner Section */}
      <section className="about-section reverse">

        <div className="about-container">

          <div className="about-content">

            <h2>Interactive Room Planner</h2>

            <p>
              FurniPlan provides an interactive environment where users can
              design rooms digitally. Whether you are decorating a new home
              or rearranging furniture, our platform helps you test different
              ideas before implementing them.
            </p>

            <p>
              This helps users avoid design mistakes and ensures furniture
              fits perfectly within their room dimensions.
            </p>

          </div>

          <div className="about-image">
            <img src={plannerImg} alt="Room Planner" />
          </div>

        </div>

      </section>

      {/* Vision Section */}
      <section className="about-section reverse">

        <div className="about-container">

          <div className="about-image">
            <img src={teamImg} alt="Our Vision" />
          </div>

          <div className="about-content">

            <h2>Our Vision</h2>

            <p>
              Our vision is to become a leading digital platform for furniture
              planning and interior space visualization. FurniPlan aims to help
              people design their living spaces with confidence by providing
              powerful yet simple tools.
            </p>

            <p>
              We aim to continuously enhance our platform by introducing
              innovative technologies, smarter design tools, and improved
              visualization features that make interior planning easier for
              everyone.
            </p>

          </div>

        </div>

      </section>

      {/* CTA Section */}
      <section className="cta-section">

        <div className="cta-container">

          <h2 className="cta-title">
            Start Designing Your Dream Room Today
          </h2>

          <p className="cta-caption">
            Explore endless furniture layouts, experiment with designs, and
            visualize your perfect living space using FurniPlan’s powerful
            3D room planner.
          </p>

          <button
            className="cta-button"
            onClick={() => navigate("/design")}
          >
            Start Planning
          </button>

        </div>

      </section>

    </div>
  );
};

export default About;