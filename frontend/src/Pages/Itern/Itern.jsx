import { Fragment, useEffect, useRef, useState } from 'react'
import './Itern.css'

/*
  Edit reviews here.
  TODO: the last 3 reviews were cut off in the screenshot, so their ending and the
  names/cities are placeholders. Replace them with your real reviews.
*/
const REVIEWS = [
  { text: 'A convenient resource for revising core physiotherapy subjects.', name: 'Riya mittal', city: 'Gujarat' },
  { text: 'The well-organized content makes revision simple and helps me prepare more effectively.', name: 'Ruhi Nair', city: 'Noida' },
  { text: 'The content is well-presented, informative, and easy to understand.', name: 'Mayank Singhal', city: 'UP' },
  { text: 'The structured layout helps me revise important topics quickly and efficiently.', name: 'Kashish Iyer', city: 'Pune' },
  { text: 'Helps me stay organized and focused during my physiotherapy exam preparation.', name: 'Sourav Sharma', city: 'Hyderabad' },
  { text: 'The book is clearly structured and helps me prepare for my physiotherapy exams more effectively.', name: 'Harsh Joshi', city: 'Nepal' },
  { text: 'Great for quick revision, with easy-to-understand explanations and all the key points conveniently organized in one place.', name: 'kabir Malhotra ', city: 'Goa' },
  { text: 'An excellent study resource for university exam preparation, with simple explanations and well-organized content.', name: 'Vansh Saxena', city: 'Vadodara' },
  { text: 'A helpful study guide for BPT students, bringing essential concepts together for quick and easy revision.', name: 'Shivansh Patel', city: 'Chennai' },
]
const TITLE = 'What Students and Interns Are Saying'.split(' ')
const initials = (n) => n.split(' ')[0].slice(0, 2).toUpperCase()

function useInView(ref) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold: 0.12 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [ref])
  return on
}

export default function Interns() {
  const ref = useRef(null)
  const on = useInView(ref)
  const [hov, setHov] = useState(null)
  const [act, setAct] = useState(0)

  // gold highlight moves from card to card
  useEffect(() => {
    if (!on || hov !== null) return
    const t = setInterval(() => setAct((a) => (a + 1) % REVIEWS.length), 2600)
    return () => clearInterval(t)
  }, [on, hov])
  const lit = hov ?? act

  return (
    <section className={`iv ${on ? 'in' : ''}`} ref={ref} id="reviews">
      <div className="iv-glow g1" /><div className="iv-glow g2" />
      <div className="iv-wrap">
        <div className="iv-pill rv" style={{ '--d': '.1s' }}><i />STUDENT REVIEWS</div>

        <h2 className="iv-h">
          {TITLE.map((w, i) => (
            <Fragment key={w}>
              <span className="w"><b style={{ '--d': `${0.2 + i * 0.1}s` }}>{w}</b></span>{' '}
            </Fragment>
          ))}
        </h2>

        <div className="iv-grid">
          {REVIEWS.map((r, i) => (
            <article
              key={i}
              className={`iv-card rv ${lit === i ? 'lit' : ''}`}
              style={{ '--d': `${0.5 + (i % 3) * 0.12 + Math.floor(i / 3) * 0.1}s` }}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
            >
              <div className="iv-top">
                <div className="iv-stars" role="img" aria-label="5 out of 5 stars">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <span key={k} style={{ '--s': `${0.9 + (i % 3) * 0.1 + k * 0.08}s` }}>★</span>
                  ))}
                </div>
                <span className="iv-q" aria-hidden="true">“</span>
              </div>
              <p>“{r.text}”</p>
              <div className="iv-by">
                <span className="iv-av">{initials(r.name)}</span>
                <div><b>{r.name}</b><span>{r.city}</span></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}