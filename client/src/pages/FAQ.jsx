import React, { useState } from "react";
import "../styles/FAQ.css";
import { FaChevronDown } from "react-icons/fa";

const faqData = [
  {
    question: "What is FurniPlan?",
    answer:
      "FurniPlan is a 3D furniture planning platform that allows users to visualize and design their room layouts before arranging furniture in real life."
  },
  {
    question: "How do I start designing my room?",
    answer:
      "You can start by visiting the Design Catalog and selecting a room template or creating your own layout using the planning tools."
  },
  {
    question: "Do I need an account to use FurniPlan?",
    answer:
      "Some features require an account, especially saving designs and managing your furniture selections."
  },
  {
    question: "Can I purchase furniture directly from FurniPlan?",
    answer:
      "FurniPlan allows you to explore furniture designs and layouts, but purchases may be completed through external furniture stores."
  },
  {
    question: "Is FurniPlan free to use?",
    answer:
      "Basic features of FurniPlan are free, allowing users to design and visualize furniture layouts easily."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">

      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-hero-container">

          <span className="faq-tag">Support</span>

          <h1 className="faq-title">
            Frequently Asked <span className="faq-accent">Questions</span>
          </h1>

          <p className="faq-description">
            Find answers to the most common questions about using FurniPlan.
          </p>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-container">

          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`faq-card ${activeIndex === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >

              <div className="faq-question">

                <h3>{faq.question}</h3>

                <FaChevronDown
                  className={`faq-icon ${
                    activeIndex === index ? "rotate" : ""
                  }`}
                />

              </div>

              {activeIndex === index && (
                <p className="faq-answer">{faq.answer}</p>
              )}

            </div>
          ))}

        </div>
      </section>

    </div>
  );
};

export default FAQ;