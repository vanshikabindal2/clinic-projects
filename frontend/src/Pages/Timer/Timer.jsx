import { useEffect, useRef, useState } from "react";
import "./Timer.css";

// Offer length. Timer auto-restarts when it reaches 0, so it never stops.
const DURATION = 7 * 60 * 60 * 1000; // 7 hours
const KEY = "bptOfferEnd";
const BUY_LINK = "#buy"; // <-- apna payment link yaha daalo

function getEnd() {
  let end = 0;
  try {
    end = parseInt(localStorage.getItem(KEY), 10) || 0;
  } catch (e) {}
  if (!end || end <= Date.now()) {
    end = Date.now() + DURATION;
    try {
      localStorage.setItem(KEY, String(end));
    } catch (e) {}
  }
  return end;
}

function calc(end) {
  const total = Math.max(0, Math.floor((end - Date.now()) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// Number that flips every time its value changes (key change re-triggers CSS animation)
function FlipNumber({ value }) {
  const text = String(value).padStart(2, "0");
  return (
    <span className="num">
      <span key={text} className="flip">
        {text}
      </span>
    </span>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="box">
      <FlipNumber value={value} />
      <span className="label">{label}</span>
    </div>
  );
}

export default function Timer() {
  const endRef = useRef(getEnd());
  const [time, setTime] = useState(() => calc(endRef.current));

  useEffect(() => {
    const id = setInterval(() => {
      if (endRef.current <= Date.now()) {
        endRef.current = Date.now() + DURATION;
        try {
          localStorage.setItem(KEY, String(endRef.current));
        } catch (e) {}
      }
      setTime(calc(endRef.current));
    }, 250);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <main className="main">
        <section className="card">
          <div className="blob b1" />
          <div className="blob b2" />

          <h1>Ready to Complete Your BPT Revision?</h1>
          <p className="sub">
            Get the complete First Year to Final Year BPT Revision E-Book and
            revise essential physiotherapy concepts in one place.
          </p>

          <div className="timer" role="timer" aria-live="off">
            <TimeBox value={time.days} label="DAYS" />
            <TimeBox value={time.hours} label="HOURS" />
            <TimeBox value={time.minutes} label="MINUTES" />
            <TimeBox value={time.seconds} label="SECONDS" />
          </div>

          <a className="cta" href={BUY_LINK}>
            <strong>Get Your E-Book for ₹249</strong>
            <small>Instant PDF access by email</small>
          </a>
        </section>
      </main>

      <footer className="footer">
        <a href="#support">Support &amp; contact</a>
        <p>© 2026 NexNote. Digital product — no refunds after download.</p>
      </footer>
    </div>
  );
}