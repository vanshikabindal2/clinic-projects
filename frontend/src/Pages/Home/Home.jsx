
import { useEffect, useMemo, useRef, useState } from 'react'
import './Home.css'
import bookImg from '../../assets/book.png'
import Pricing from '../Pricing/Pricing.jsx'
import BptPreview from '../BptPreview/BptPreview.jsx'
import Addon from '../Addon/Addon.jsx'
import Itern from '../Itern/Itern.jsx'
import Faq from '../Faq/Faq.jsx'
import Whythisbook from '../Whythisbook/whythisbook.jsx'
import Timer from '../Timer/Timer.jsx'
// Book image: src/assets/book.png (transparent PNG, trimmed, looks best)
const BOOK_SRC = bookImg
const DOWNLOAD_LINK = '#' // TODO: add your payment / download link

const CHAPTERS = [
  ['Cover & Introduction', '1–2'], ['Human Anatomy', '3–36'], ['Human Physiology', '37–56'],
  ['Biochemistry', '57–62'], ['Psychology & Sociology', '63–68'], ['Pathology & Microbiology', '69–78'],
  ['Pharmacology', '79–84'], ['Biomechanics & Kinesiology', '85–110'], ['Exercise Therapy', '111–142'],
  ['Electrotherapy & Electrophysical Agents', '143–174'], ['General Medicine & Surgery', '175–188'],
  ['Orthopaedics & Traumatology', '189–218'], ['Neurology & Neurosurgery', '219–242'],
]

const ICONS = {
  book: <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5.7 1.5 1.5z" />,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".8" /></>,
  brain: <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 4 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 4 3 3 0 0 1-6 1" />,
  steth: <><path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></>,
  doc: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M9.5 12h6M9.5 16h6" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></>,
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
}
const Icon = ({ name, className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{ICONS[name]}</svg>
)

const FEATURES = [
  { icon: 'target', color: '#5b3df5', top: 'Exam-Focused', bottom: 'Content' },
  { icon: 'brain', color: '#1fa970', top: 'Easy to', bottom: 'Understand' },
  { icon: 'steth', color: '#e5446d', top: 'Clinical', bottom: 'Application' },
  { icon: 'doc', color: '#f0a020', top: 'Concept', bottom: 'Notes' },
]
const CHECKS = ['Notes', 'Diagrams', 'MCQs', 'Important Qs']
const SHELF = ['Anatomy', 'Physiology', 'Pathology', 'Pharmacology']

function useCountUp(to, delay = 1800) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf
    const t0 = performance.now() + delay
    const f = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / 1500))
      setV(Math.round(to * (1 - (1 - k) ** 3)))
      if (k < 1) raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [to, delay])
  return v
}

function ripple(e) {
  const b = e.currentTarget
  const r = b.getBoundingClientRect()
  const d = document.createElement('span')
  d.className = 'rp'
  d.style.width = d.style.height = '60px'
  d.style.left = `${e.clientX - r.left - 30}px`
  d.style.top = `${e.clientY - r.top - 30}px`
  b.appendChild(d)
  setTimeout(() => d.remove(), 600)
}

function Sparkles({ count = 16 }) {
  const items = useMemo(
    () => Array.from({ length: count }, () => ({
      left: `${8 + Math.random() * 84}%`,
      top: `${8 + Math.random() * 80}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2.4 + Math.random() * 2.4}s`,
    })), [count])
  return items.map((s, i) => <span key={i} className="sp" style={s} />)
}

// Auto-crops empty space around the AI image, so the book always sits on the podium
function useTrimmed(src) {
  const [out, setOut] = useState(src)
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      try {
        const w = img.naturalWidth, h = img.naturalHeight
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        const ctx = c.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(0, 0, w, h).data
        const cr = d[0], cg = d[1], cb = d[2], ca = d[3]
        const hasAlpha = ca < 20
        const isBg = (i) => hasAlpha
          ? d[i + 3] < 20
          : Math.abs(d[i] - cr) + Math.abs(d[i + 1] - cg) + Math.abs(d[i + 2] - cb) < 40
        let x0 = w, x1 = 0, y0 = h, y1 = 0
        for (let y = 0; y < h; y += 2) {
          for (let x = 0; x < w; x += 2) {
            if (!isBg((y * w + x) * 4)) {
              if (x < x0) x0 = x
              if (x > x1) x1 = x
              if (y < y0) y0 = y
              if (y > y1) y1 = y
            }
          }
        }
        if (x1 <= x0 || y1 <= y0) return
        const cw = x1 - x0 + 1, ch = y1 - y0 + 1
        if (cw > w * 0.97 && ch > h * 0.97) return // nothing to trim
        const o = document.createElement('canvas')
        o.width = cw; o.height = ch
        o.getContext('2d').drawImage(c, x0, y0, cw, ch, 0, 0, cw, ch)
        setOut(o.toDataURL('image/png'))
      } catch (e) { /* keep original image */ }
    }
    img.src = src
  }, [src])
  return out
}

function BookImage() {
  const src = useTrimmed(BOOK_SRC)
  const [ok, setOk] = useState(true)
  if (!ok) {
    return (
      <div className="ph">
        <div>Add your AI book image here<code>src/assets/book.png</code></div>
      </div>
    )
  }
  return <img src={src} alt="BPT Complete First Year to Final Year Revision E-book cover" onError={() => setOk(false)} />
}

function PreviewModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', h)
    return () => removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="md on" role="dialog" aria-modal="true" aria-label="Chapters" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mc">
        <h3>Inside the ebook</h3>
        <ul>
          {CHAPTERS.map(([name, pages], k) => (
            <li key={name} style={{ '--d': `${k * 0.04}s` }}>
              <span>{name}</span><span>p. {pages}</span>
            </li>
          ))}
        </ul>
        <button className="btn p" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default function Home() {
  const heroRef = useRef(null)
  const bookRef = useRef(null)
  const [preview, setPreview] = useState(false)
  const pages = useCountUp(300)

  useEffect(() => {
    const move = (e) => {
      const x = (e.clientX / innerWidth) * 2 - 1
      const y = (e.clientY / innerHeight) * 2 - 1
      heroRef.current?.style.setProperty('--mx', x)
      heroRef.current?.style.setProperty('--my', y)
      if (bookRef.current) bookRef.current.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 8}deg)`
    }
    addEventListener('mousemove', move)
    return () => removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div className="bl a" /><div className="bl b" />
      <main className="hero" ref={heroRef}>
        <div className="L">
          <div className="pill a" style={{ '--d': '.1s' }}><Icon name="book" />Digital PDF E-Book</div>
          <h1>
            <span className="ln"><span style={{ '--d': '.25s' }}>Physiotherapy</span></span>
            <span className="ln"><span style={{ '--d': '.4s' }}>Clinical Casebook</span></span>
            <span className="ln hl"><span style={{ '--d': '.55s' }}>Revision E-book</span></span>
          </h1>
          <p className="sub a" style={{ '--d': '.8s' }}>Your Complete Guide for Physiotherapy Clinical Casebook — Smarter Revision, Better Results!</p>

          <div className="feat">
            {FEATURES.map((f, i) => (
              <div className="f" key={f.top} style={{ '--d': `${1 + i * 0.1}s`, color: f.color }}>
                <div className="ic"><Icon name={f.icon} /></div>
                <b>{f.top}</b>{f.bottom}
              </div>
            ))}
          </div>

          <div className="btns a" style={{ '--d': '1.4s' }}>
            <a className="btn p" href={DOWNLOAD_LINK} onClick={ripple}>
              <Icon name="download" />Download E-Book<Icon name="arrow" className="ar" />
            </a>
            <button className="btn o" onClick={(e) => { ripple(e); setPreview(true) }}>
              <Icon name="book" />Preview Chapters
            </button>
          </div>

          <div className="st a" style={{ '--d': '1.6s' }}>
            <div className="s"><Icon name="doc" /><div><b>{pages}+</b><span>Pages</span></div></div>
            <div className="s"><Icon name="calendar" /><div><b>All 4 Years</b><span>(1st - 4th)</span></div></div>
            <div className="s"><Icon name="shield" /><div><b>Exam-Focused</b><span>(Theory + Clinical)</span></div></div>
          </div>
        </div>

        <div className="R">
          <div className="stage">
            <div className="px pod" style={{ '--k': 4 }} />
            <div className="px rw"><div className="ri" /></div>
            <div className="px bkf" style={{ '--k': 14 }}>
              <div className="bk3" ref={bookRef}><BookImage /></div>
            </div>
            <div className="px rw f"><div className="ri" /></div>

            <div className="px hand"><span>Study<br />Smarter</span></div>
            {/* <svg className="px arr" viewBox="0 0 80 70" aria-hidden="true">
              <path pathLength="1" d="M4 6C40 0 72 22 62 62M62 62l-12-12M62 62l10-14" />
            </svg> */}
            <div className="px plane">
              <svg viewBox="0 0 60 50" aria-hidden="true"><path d="M3 22L57 3 40 47 29 31zM29 31L57 3" /></svg>
            </div>

            <ul className="px chk">
              {CHECKS.map((c, i) => (
                <li key={c}>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path pathLength="1" style={{ '--d': `${2.6 + i * 0.3}s` }} d="M3 10l5 5 9-10" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>

            <div className="px sheet"><i /></div>
            <div className="px steth">
              <svg viewBox="0 0 160 90" aria-hidden="true">
                <path pathLength="1" d="M4 8C20 40 40 60 70 60S120 40 110 18M110 18C112 6 128 6 130 18S124 46 124 56" />
                <circle cx="124" cy="68" r="14" />
              </svg>
            </div>
            <Sparkles />
          </div>
        </div>

        <div className="bs">
          {SHELF.map((s, i) => <div key={s} style={{ '--d': `${0.5 + i * 0.15}s` }}>{s}</div>)}
        </div>
        <svg className="pl" viewBox="0 0 90 160" aria-hidden="true">
          <path d="M45 160C40 110 20 90 6 70c26 2 38 22 39 50z" />
          <path d="M45 160C48 100 62 70 84 52c-2 30-22 50-39 108z" />
          <path d="M45 160C44 120 40 80 52 36c12 36 2 80-7 124z" />
        </svg>
      </main>
      <PreviewModal open={preview} onClose={() => setPreview(false)} />
        <Pricing/>
        <BptPreview/>
        <Addon/>
        <Itern/>
         <Whythisbook/>
        <Faq/>
       <Timer/>
    </>
  )
}