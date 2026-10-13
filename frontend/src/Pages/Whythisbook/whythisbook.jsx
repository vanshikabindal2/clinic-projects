import React from "react";
import "./Whythisbook.css";

const features = [
  {
    icon: "📚",
    title: "Complete BPT Coverage",
    description:
      "First Year se Final Year tak ke important BPT concepts ek hi jagah par revise karein.",
    number: "01",
  },
  {
    icon: "🎯",
    title: "Exam-Focused Revision",
    description:
      "University exams, competitive exams aur MPT entrance preparation ke liye focused content.",
    number: "02",
  },
  {
    icon: "⚡",
    title: "Quick & Easy Revision",
    description:
      "Anytime, anywhere apne important topics revise karein bina multiple books carry kiye.",
    number: "03",
  },
];

const Whythisbook = () => {
  return (
    <section className="why-ebook">
      <div className="ebook-container">

        <div className="ebook-heading">
          <span className="ebook-label">
            YOUR SMARTER WAY TO LEARN
          </span>

          <h2>
            Why Choose Our <span>Ebook?</span>
          </h2>

          <p>
            Everything you need for smarter learning and
            confident exam preparation.
          </p>
        </div>

        <div className="ebook-cards">
          {features.map((item) => (
            <div className="ebook-card" key={item.number}>

              <div className="ebook-card-top">
                <span className="ebook-number">
                  {item.number}
                </span>

                <div className="ebook-icon">
                  {item.icon}
                </div>
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

              <div className="ebook-line"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Whythisbook;