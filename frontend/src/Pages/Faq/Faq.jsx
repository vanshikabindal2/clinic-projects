import { Fragment, useEffect, useId, useRef, useState } from 'react'
import './Faq.css'

/*
  Edit questions and answers here.
  NOTE: the screenshot showed only the questions, so these answers are drafts
  based on the page content. Change them to match your exact offer.
*/
const FAQS = [
  {
    q: 'What is included in the ebook?',
    a: 'The e-book covers essential BPT subjects from First Year to Final Year, with concise, exam-focused explanations to help you revise important concepts efficiently.',
  },
  {
    q: 'Can I use this on mobile, tablet and laptop?',
    a: 'Yes. The PDF works on any device that supports PDF files, including phones, tablets, laptops and desktops.',
  },
  {
    q: 'Who is this ebook for?',
    a: 'It is designed for BPT students preparing for university exams, competitive examinations, government physiotherapy recruitment exams, and MPT entrance preparation.',
  },
  {
    q: 'How will I receive the ebook after payment?',
    a: 'After successful payment, your download opens instantly and a backup download link is sent to your email.',
  },
  {
    q: 'Can I use this e-book for government physiotherapy exam preparation?',
    a: 'Yes. The content is structured as a revision resource covering important BPT concepts that can support preparation for physiotherapy recruitment and competitive examinations.',
  },
  {
    q: 'Can I read the ebook on my phone?',
    a: 'Yes. It is a digital PDF designed to open on phones, tablets, laptops and computers.',
  },
]
const TITLE = 'Frequently Asked Questions'.split(' ')

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

export default function Faq() {
  const ref = useRef(null)
  const on = useInView(ref)
  const [open, setOpen] = useState(null)
  const uid = useId()

  return (
    <section className={`fq ${on ? 'in' : ''}`} ref={ref} id="faq">
      <div className="fq-glow g1" /><div className="fq-glow g2" />
      <div className="fq-wrap">
        <div className="fq-pill rv" style={{ '--d': '.1s' }}><i />FAQ SECTION</div>

        <h2 className="fq-h">
          {TITLE.map((w, i) => (
            <Fragment key={w}>
              <span className="w"><b style={{ '--d': `${0.2 + i * 0.12}s` }}>{w}</b></span>{' '}
            </Fragment>
          ))}
        </h2>

        <div className="fq-list">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.q}
                className={`fq-item rv ${isOpen ? 'open' : ''}`}
                style={{ '--d': `${0.5 + i * 0.1}s` }}
              >
                <h3>
                  <button
                    type="button"
                    className="fq-q"
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a${i}`}
                    id={`${uid}-q${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{f.q}</span>
                    <span className="fq-chev" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                    </span>
                  </button>
                </h3>
                <div className="fq-a" id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`}>
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}