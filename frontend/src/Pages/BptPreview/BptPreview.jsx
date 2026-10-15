
import React, { useEffect, useState } from "react";
import "./BptPreview.css";
import b2 from "../../assets/b2.png";
import b4 from "../../assets/b4.png";

import b from "../../assets/b.png";
import b3 from "../../assets/b3.png";
import bac from "../../assets/bac.jpeg";

const slides = [b2,b,b3,b4];

const features = [
  {
    icon: "📚",
    title: "Well-Organized",
    text: "Chapter-wise Content",
    color: "coral",
  },
  {
    icon: "🧠",
    title: "Easy to Understand",
    text: "Key Concepts",
    color: "purple",
  },
  {
    icon: "✓",
    title: "Exam Focused",
    text: "Prepare with Confidence",
    color: "green",
  },
];

export default function BptPreview() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const previousSlide = () => {
    setActive(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };

  const nextSlide = () => {
    setActive((current) => (current + 1) % slides.length);
  };

  return (

<section
  className="bpt-preview"
  style={{
    backgroundImage: `url(${bac})`,
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
      <div className="bpt-glow bpt-glow-one" />
      <div className="bpt-glow bpt-glow-two" />

      <div className="bpt-heading">
        <span className="bpt-eyebrow">
          <span className="eyebrow-icon">✦</span>
          YOUR STUDY JOURNEY STARTS HERE
        </span>

        <h2>
          Take A Look <span>Inside</span>
        </h2>

        <p>
          Your complete BPT revision, from First Year to Final Year,
          all in one book. 📚
        </p>

        <div className="bpt-heading-line" />
      </div>

      <div className="bpt-showcase">
        <div className="bpt-features">
          {features.map((feature, index) => (
            <div
              className="bpt-feature"
              style={{ "--feature-index": index }}
              key={feature.title}
            >
              <div className={`feature-icon ${feature.color}`}>
                {feature.icon}
              </div>

              <div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            </div>
          ))}

          <div className="bpt-handwriting">
            Learn <br />
            Revise <br />
            Excel <span>♡</span>
          </div>
        </div>

        <div className="bpt-slider-area">
          <div className="bpt-floating-tag">
            <span>✦</span> Preview · Page {active + 1}
          </div>

          <div className="bpt-image-frame">
            <div className="bpt-image-stack" />

            <div className="bpt-slide-window">
              {slides.map((image, index) => (
                <img
                  src={image}
                  alt={`BPT revision preview ${index + 1}`}
                  className={`bpt-slide ${
                    active === index ? "active" : ""
                  }`}
                  key={image}
                />
              ))}
            </div>

            <button
              type="button"
              className="bpt-arrow bpt-arrow-left"
              onClick={previousSlide}
              aria-label="Previous image"
            >
              &#8592;
            </button>

            <button
              type="button"
              className="bpt-arrow bpt-arrow-right"
              onClick={nextSlide}
              aria-label="Next image"
            >
              &#8594;
            </button>
          </div>

          <div className="bpt-slider-bottom">
            <div className="bpt-dots">
              {slides.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActive(index)}
                  className={`bpt-dot ${
                    active === index ? "selected" : ""
                  }`}
                  aria-label={`Show image ${index + 1}`}
                />
              ))}
            </div>

            <span className="bpt-counter">
              0{active + 1} <span>/ 0{slides.length}</span>
            </span>
          </div>
        </div>

     
      </div>

      <div className="bpt-bottom-text">
        <span>✦</span> Your next chapter to success starts here.
      </div>
    </section>
  );
}
