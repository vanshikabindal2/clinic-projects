import { Fragment, useEffect, useRef, useState } from 'react'
import './Addon.css'
import nextnote from '../../assets/nextnote.png' // put your full book image here (same name, or change the path)
import { useNavigate } from 'react-router-dom'
const PRICE = 179
// const ADD_LINK = '#'
const ROWS = [
  ['🩺', '111 Clinical Cases'], ['📋', 'Clinical Presentation'], ['🔍', 'Assessment Approach'],
  ['🧠', 'Clinical Reasoning'], ['🎯', 'Treatment Planning'], ['♻️', 'Rehabilitation Approach'],
  ['📚', 'Theory to Clinical Practice'],
]
const LINE1 = ['Physiotherapy', '111', 'Clinical', 'Cases']
const WHO = [
  ['🎓', 'Physiotherapy Students'], ['📚', 'BPT & B.Sc. Students'], ['🎯', 'Government Job Aspirants'],
  ['📝', 'Students Preparing for Competitive Exams'], ['🔄', 'Physiotherapy Graduates'],
  ['🚀', 'Anyone Building a Strong Physiotherapy Foundation'],
]
const WHO_TITLE = 'Built for Every Stage of Your Physiotherapy Journey'.split(' ')

const FEATURES = [
  { icon: '📚', title: 'Complete BPT Coverage', text: 'Cover essential BPT subjects from First Year to Final Year in one structured revision book.' },
  { icon: '⚡', title: 'Fast Exam Revision', text: 'Quickly revise important concepts, definitions, classifications, and clinical points before your exams.' },
  { icon: '🎯', title: 'Exam-Focused Content', text: 'Focused content for university exams, competitive exams, and government physiotherapy recruitment preparation.' },
  { icon: '🧠', title: 'Core Subjects Simplified', text: 'Strengthen your understanding of core subjects including Anatomy, Physiology, Biomechanics, Exercise Therapy, Electrotherapy, Orthopaedics, Neurology, and more.' },
  { icon: '📖', title: 'One Book, All Years', text: 'Useful for BPT students preparing across different academic years without switching between multiple revision resources.' },
  { icon: '📱', title: 'Read Anywhere', text: 'Digital PDF that you can access from your phone, tablet or computer.' },
]
const FEAT_TITLE = 'Features That Support Preparation'.split(' ')

function useInView(ref) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold: 0.15 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [ref])
  return on
}

function useCount(to, run, delay = 600, dur = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf
    const t0 = performance.now() + delay
    const f = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / dur))
      setV(Math.round(to * (1 - (1 - k) ** 4)))
      if (k < 1) raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [to, run, delay, dur])
  return v
}

export default function AddOn() {
  const navigate = useNavigate()
  const ref = useRef(null)
  const bookRef = useRef(null)
  const btnRef = useRef(null)
  const on = useInView(ref)
  const price = useCount(PRICE, on)

  const whoRef = useRef(null)
  const whoOn = useInView(whoRef)
  const [hov, setHov] = useState(null)
  const [act, setAct] = useState(0)
  useEffect(() => {
    if (!whoOn || hov !== null) return
    const t = setInterval(() => setAct((a) => (a + 1) % WHO.length), 2200)
    return () => clearInterval(t)
  }, [whoOn, hov])
  const lit = hov ?? act
  const spot = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }


  // ---- Features block ----
  const featRef = useRef(null)
  const featOn = useInView(featRef)
  const [fh, setFh] = useState(null)
  const [fa, setFa] = useState(1)
  useEffect(() => {
    if (!featOn || fh !== null) return
    const t = setInterval(() => setFa((x) => (x + 1) % FEATURES.length), 2400)
    return () => clearInterval(t)
  }, [featOn, fh])
  const fl = fh ?? fa
  const fmove = (e) => {
    const c = e.currentTarget
    const r = c.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    c.style.setProperty('--mx', `${x}px`)
    c.style.setProperty('--my', `${y}px`)
    c.style.setProperty('--rx', `${(0.5 - y / r.height) * 8}deg`)
    c.style.setProperty('--ry', `${(x / r.width - 0.5) * 8}deg`)
  }
  const fleave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
    setFh(null)
  }

  const tilt = (e) => {
    const r = bookRef.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 2 - 1
    const y = ((e.clientY - r.top) / r.height) * 2 - 1
    bookRef.current.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) scale(1.03)`
  }
  const untilt = () => { bookRef.current.style.transform = '' }

  const magnet = (e) => {
    const b = btnRef.current
    const r = b.getBoundingClientRect()
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`
  }
  const ripple = (e) => {
    const b = e.currentTarget
    const r = b.getBoundingClientRect()
    const d = document.createElement('span')
    d.className = 'ad-rp'
    d.style.left = `${e.clientX - r.left - 40}px`
    d.style.top = `${e.clientY - r.top - 40}px`
    b.appendChild(d)
    setTimeout(() => d.remove(), 700)
  }

  return (
    <section className={`ad ${on ? 'in' : ''}`} ref={ref} id="addon">
      <div className="ad-glow g1" /><div className="ad-glow g2" />
      <div className="ad-wrap">
        <div className="ad-pill rv" style={{ '--d': '.1s' }}><i />ADD-ON · JUST ₹{PRICE}</div>

        <h2 className="ad-h">
          <span className="ln">
            {LINE1.map((w, i) => (
              <Fragment key={w}>
                <span className="w"><b style={{ '--d': `${0.25 + i * 0.12}s` }}>{w}</b></span>{' '}
              </Fragment>
            ))}
          </span>
          <span className="ln gold"><span className="w"><b style={{ '--d': '.8s' }}>Handbook</b></span></span>
        </h2>

        <div className="ad-stage rv" style={{ '--d': '.9s' }}>
          <span className="ad-ring" /><span className="ad-ring r2" />
          <span className="ad-sp s1" /><span className="ad-sp s2" /><span className="ad-sp s3" /><span className="ad-sp s4" />
          <div className="ad-book" ref={bookRef} onMouseMove={tilt} onMouseLeave={untilt}>
            <img src={nextnote} alt="Physiotherapy Clinical Casebook: 111 real clinical cases" />
            <i className="ad-shine" />
          </div>
        </div>

        <p className="ad-desc rv" style={{ '--d': '1.1s' }}>
          111 practical physiotherapy clinical cases covering common conditions, assessment findings, treatment approaches, and rehabilitation planning. Built to help you connect classroom knowledge with real clinical situations and strengthen your clinical reasoning.
        </p>

        <ul className="ad-list">
          {ROWS.map(([e, t], i) => (
            <li className={`rv ${i % 2 ? 'r' : 'l'}`} key={t} style={{ '--d': `${1.2 + i * 0.11}s` }}>
              <span className="e">{e}</span>{t}
            </li>
          ))}
        </ul>

        <p className="ad-tag rv" style={{ '--d': '2.1s' }}>
          Less unnecessary theory. More visual learning. <span>More practical knowledge.</span>
        </p>

{/* add to it ordre button */}
<div className="ad-cta rv" style={{ '--d': '2.3s' }}>
  <button
    type="button"
    className="ad-btn"
    onClick={() => navigate('/checkout')}
  >
    <b>ADD IT TO MY ORDER</b>
    <small>Continue to secure checkout · ₹{price}</small>
  </button>
</div>
      </div>

      <div className={`ad-who ${whoOn ? 'in' : ''}`} ref={whoRef}>
        <div className="ad-pill sm wv" style={{ '--d': '.1s' }}><i />WHO IS THIS FOR</div>
        <h2 className="ad-h2">
          {WHO_TITLE.map((w, i) => (
            <Fragment key={w + i}>
              <span className="w"><b style={{ '--d': `${0.2 + i * 0.07}s` }}>{w}</b></span>{' '}
            </Fragment>
          ))}
        </h2>
        <div className="ad-grid">
          {WHO.map(([e, t], i) => (
            <div
              key={t}
              className={`ad-card wv ${lit === i ? 'act' : ''}`}
              style={{ '--d': `${0.7 + i * 0.12}s`, '--rot': i % 2 ? '3deg' : '-3deg' }}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              onMouseMove={spot}
            >
              <span className="t">{e}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`ft ${featOn ? 'in' : ''}`} ref={featRef} id="features">
        <div className="ft-glow g1" /><div className="ft-glow g2" />
        <div className="ft-wrap">
          <div className="ft-pill rv" style={{ '--d': '.1s' }}><i />WHAT YOU WILL GAIN</div>
          <h2 className="ft-h">
            {FEAT_TITLE.map((w, i) => (
              <Fragment key={w}>
                <span className="w"><b style={{ '--d': `${0.2 + i * 0.12}s` }}>{w}</b></span>{' '}
              </Fragment>
            ))}
          </h2>
          <div className="ft-grid">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className={`ft-card rv ${fl === i ? 'lit' : ''}`}
                style={{ '--d': `${0.6 + i * 0.13}s`, '--i': i }}
                onMouseEnter={() => setFh(i)}
                onMouseMove={fmove}
                onMouseLeave={fleave}
              >
                <div className="ft-head">
                  <span className="ft-ic">{f.icon}</span>
                  <h3>{f.title}</h3>
                </div>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}