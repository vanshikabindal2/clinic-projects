// import { useEffect, useRef, useState } from 'react'
// import './Pricing.css'

// const PRICE = 249
// const MRP = 2499
// const OFF = 90
// const CHECKOUT_LINK = '#' // TODO: add your Razorpay payment link

// const CHIPS = [
//   { label: 'Format: PDF', icon: 'doc' },
//   { label: 'Delivery: Email', icon: 'mail' },
//   { label: 'Secure payment', icon: 'lock' },
// ]

// const TRUST = [
//   { icon: 'books', title: 'All BPT Years Covered', text: 'Complete First Year to Final Year Coverage' },
//   { icon: 'lock', title: 'Razorpay secured', text: 'UPI, cards & netbanking' },
//   { icon: 'bolt', title: 'Instant delivery', text: 'Download link in seconds' },
//   { icon: 'target', title: 'Exam-Focused Content', text: 'Concise, Exam-Focused Physiotherapy Concepts' },
// ]

// const ICONS = {
//   doc: (
//     <svg viewBox="0 0 24 24"><path d="M6 2h8l5 5v15H6z" fill="#eef0ff" stroke="#8b93d6" strokeWidth="1.4" /><path d="M9 12h7M9 16h7" stroke="#8b93d6" strokeWidth="1.4" strokeLinecap="round" /></svg>
//   ),
//   mail: (
//     <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#dfe8ff" /><circle cx="12" cy="12" r="4" fill="#3f6cf2" /></svg>
//   ),
//   lock: (
//     <svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="#f2a53a" /><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#d98a1c" strokeWidth="2" /><circle cx="12" cy="15.5" r="1.6" fill="#7a4a07" /></svg>
//   ),
//   books: (
//     <svg viewBox="0 0 24 24"><rect x="3" y="7" width="9" height="13" rx="1.5" fill="#39b86a" /><rect x="8" y="4" width="9" height="13" rx="1.5" fill="#4a7df0" /><rect x="13" y="9" width="8" height="12" rx="1.5" fill="#e0508f" /></svg>
//   ),
//   bolt: (
//     <svg viewBox="0 0 24 24"><path d="M13.5 2 5 13.5h6L10 22l9-12h-6z" fill="#ff7a2f" /></svg>
//   ),
//   target: (
//     <svg viewBox="0 0 24 24"><circle cx="11" cy="13" r="8" fill="#e8467c" /><circle cx="11" cy="13" r="5.2" fill="#fff" /><circle cx="11" cy="13" r="2.6" fill="#e8467c" /><path d="M12 12l8-8" stroke="#3f6cf2" strokeWidth="2" strokeLinecap="round" /></svg>
//   ),
// }

// function useInView(ref) {
//   const [on, setOn] = useState(false)
//   useEffect(() => {
//     const io = new IntersectionObserver(([e]) => {
//       if (e.isIntersecting) { setOn(true); io.disconnect() }
//     }, { threshold: 0.25 })
//     if (ref.current) io.observe(ref.current)
//     return () => io.disconnect()
//   }, [ref])
//   return on
// }

// function useCount(to, run, delay = 500, dur = 1500) {
//   const [v, setV] = useState(0)
//   useEffect(() => {
//     if (!run) return
//     let raf
//     const t0 = performance.now() + delay
//     const f = (t) => {
//       const k = Math.min(1, Math.max(0, (t - t0) / dur))
//       setV(Math.round(to * (1 - (1 - k) ** 4)))
//       if (k < 1) raf = requestAnimationFrame(f)
//     }
//     raf = requestAnimationFrame(f)
//     return () => cancelAnimationFrame(raf)
//   }, [to, run, delay, dur])
//   return v
// }

// export default function Pricing() {
//   const ref = useRef(null)
//   const btnRef = useRef(null)
//   const on = useInView(ref)
//   const price = useCount(PRICE, on)

//   const magnet = (e) => {
//     const b = btnRef.current
//     const r = b.getBoundingClientRect()
//     b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`
//   }
//   const reset = () => { btnRef.current.style.transform = '' }
//   const ripple = (e) => {
//     const b = e.currentTarget
//     const r = b.getBoundingClientRect()
//     const d = document.createElement('span')
//     d.className = 'pr-rp'
//     d.style.left = `${e.clientX - r.left - 40}px`
//     d.style.top = `${e.clientY - r.top - 40}px`
//     b.appendChild(d)
//     setTimeout(() => d.remove(), 700)
//   }

//   return (
//     <section className={`pr ${on ? 'in' : ''}`} ref={ref} id="buy">
//       <div className="pr-glow" />

//       <div className="pr-top">
//         <div className="pr-price pr-r" style={{ '--d': '.1s' }}>
//           <span className="pr-mrp">₹{MRP.toLocaleString('en-IN')}</span>
//           <span className="pr-now">₹{price}</span>
//           <span className="pr-off">{OFF}% OFF</span>
//         </div>

//         <p className="pr-sub pr-r" style={{ '--d': '.3s' }}>One-time payment · Lifetime access · No subscription</p>

//         <div className="pr-cta pr-r" style={{ '--d': '.5s' }}>
//           <span className="pr-sp s1" /><span className="pr-sp s2" /><span className="pr-sp s3" /><span className="pr-sp s4" />
//           <a
//             ref={btnRef}
//             className="pr-btn"
//             href={CHECKOUT_LINK}
//             onMouseMove={magnet}
//             onMouseLeave={reset}
//             onClick={ripple}
//           >
//             <b>Get the Ebook</b>
//             <small>Click here for instant access</small>
//           </a>
//         </div>

//         <div className="pr-chips">
//           {CHIPS.map((c, i) => (
//             <span className="pr-chip pr-r" key={c.label} style={{ '--d': `${0.8 + i * 0.12}s` }}>
//               <i>{ICONS[c.icon]}</i>{c.label}
//             </span>
//           ))}
//         </div>

//         <p className="pr-note pr-r" style={{ '--d': '1.2s' }}><b>Note:</b> You will receive a digital copy only, not a hard copy.</p>
//       </div>

//       <div className="pr-strip">
//         <div className="pr-sweep" />
//         <div className="pr-grid">
//           {TRUST.map((t, i) => (
//             <div className="pr-item pr-r" key={t.title} style={{ '--d': `${1 + i * 0.14}s` }}>
//               <span className="pr-ic">{ICONS[t.icon]}</span>
//               <div><b>{t.title}</b><span>{t.text}</span></div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }





import { useEffect, useRef, useState } from 'react'
import './Pricing.css'

const PRICE = 249
const MRP = 2499
const OFF = 90

const CHECKOUT_LINK = '#' // Add your Razorpay payment link here

const CHIPS = [
  { label: 'Format: PDF', icon: 'doc' },
  { label: 'Delivery: Email', icon: 'mail' },
  { label: 'Secure payment', icon: 'lock' },
]

const TRUST = [
  {
    icon: 'books',
    title: 'All BPT Years Covered',
    text: 'Complete First Year to Final Year Coverage',
  },
  {
    icon: 'lock',
    title: 'Razorpay secured',
    text: 'UPI, cards & netbanking',
  },
  {
    icon: 'bolt',
    title: 'Instant delivery',
    text: 'Download link in seconds',
  },
  {
    icon: 'target',
    title: 'Exam-Focused Content',
    text: 'Concise, Exam-Focused Physiotherapy Concepts',
  },
]

const ICONS = {
  doc: (
    <svg viewBox="0 0 24 24">
      <path
        d="M6 2h8l5 5v15H6z"
        fill="#eef0ff"
        stroke="#8b93d6"
        strokeWidth="1.4"
      />
      <path
        d="M9 12h7M9 16h7"
        stroke="#8b93d6"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),

  mail: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="#dfe8ff" />
      <circle cx="12" cy="12" r="4" fill="#3f6cf2" />
    </svg>
  ),

  lock: (
    <svg viewBox="0 0 24 24">
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2.5"
        fill="#f2a53a"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="#d98a1c"
        strokeWidth="2"
      />
      <circle cx="12" cy="15.5" r="1.6" fill="#7a4a07" />
    </svg>
  ),

  books: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="7" width="9" height="13" rx="1.5" fill="#39b86a" />
      <rect x="8" y="4" width="9" height="13" rx="1.5" fill="#4a7df0" />
      <rect x="13" y="9" width="8" height="12" rx="1.5" fill="#e0508f" />
    </svg>
  ),

  bolt: (
    <svg viewBox="0 0 24 24">
      <path d="M13.5 2 5 13.5h6L10 22l9-12h-6z" fill="#ff7a2f" />
    </svg>
  ),

  target: (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="13" r="8" fill="#e8467c" />
      <circle cx="11" cy="13" r="5.2" fill="#fff" />
      <circle cx="11" cy="13" r="2.6" fill="#e8467c" />
      <path
        d="M12 12l8-8"
        stroke="#3f6cf2"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
}

function useInView(ref) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [ref])

  return on
}

function useCount(to, run, delay = 500, dur = 1500) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!run) return

    let animationFrame

    const startTime = performance.now() + delay

    const animate = (time) => {
      const progress = Math.min(
        1,
        Math.max(0, (time - startTime) / dur)
      )

      setValue(
        Math.round(to * (1 - (1 - progress) ** 4))
      )

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [to, run, delay, dur])

  return value
}

export default function Pricing() {
  const ref = useRef(null)
  const btnRef = useRef(null)

  const on = useInView(ref)
  const price = useCount(PRICE, on)

  // Button magnetic animation
  const magnet = (event) => {
    const button = btnRef.current

    if (!button) return

    const rect = button.getBoundingClientRect()

    const moveX =
      (event.clientX - rect.left - rect.width / 2) * 0.12

    const moveY =
      (event.clientY - rect.top - rect.height / 2) * 0.2

    button.style.transform = `translate(${moveX}px, ${moveY}px)`
  }

  const reset = () => {
    if (btnRef.current) {
      btnRef.current.style.transform = ''
    }
  }

  // Button ripple effect
  const ripple = (event) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()

    const rippleEffect = document.createElement('span')

    rippleEffect.className = 'pr-rp'

    rippleEffect.style.left =
      `${event.clientX - rect.left - 40}px`

    rippleEffect.style.top =
      `${event.clientY - rect.top - 40}px`

    button.appendChild(rippleEffect)

    setTimeout(() => {
      rippleEffect.remove()
    }, 700)
  }

  return (
    <section
      className={`pr ${on ? 'in' : ''}`}
      ref={ref}
      id="buy"
    >
      <div className="pr-glow" />

      <div className="pr-top">

        {/* PRICE AND FESTIVE OFFER */}

        <div
          className="pr-price pr-r"
          style={{ '--d': '.1s' }}
        >
          <span className="pr-mrp">
            ₹{MRP.toLocaleString('en-IN')}
          </span>

          <span className="pr-now">
            ₹{price}
          </span>

          <div className="pr-festive-off">
            <span className="pr-festive-label">
              🎉 Festive Season
            </span>

            <span className="pr-off">
              {OFF}% OFF
            </span>
          </div>
        </div>

        {/* SUBTITLE */}

        <p
          className="pr-sub pr-r"
          style={{ '--d': '.3s' }}
        >
          One-time payment · Lifetime access · No subscription
        </p>

        {/* GET EBOOK BUTTON */}

        <div
          className="pr-cta pr-r"
          style={{ '--d': '.5s' }}
        >
          <span className="pr-sp s1" />
          <span className="pr-sp s2" />
          <span className="pr-sp s3" />
          <span className="pr-sp s4" />

          <a
            ref={btnRef}
            className="pr-btn"
            href={CHECKOUT_LINK}
            onMouseMove={magnet}
            onMouseLeave={reset}
            onClick={ripple}
          >
            <b>Get the Ebook</b>

            <small>
              Click here for instant access
            </small>
          </a>
        </div>

        {/* PAYMENT INFORMATION CHIPS */}

        <div className="pr-chips">
          {CHIPS.map((chip, index) => (
            <span
              className="pr-chip pr-r"
              key={chip.label}
              style={{
                '--d': `${0.8 + index * 0.12}s`,
              }}
            >
              <i>{ICONS[chip.icon]}</i>

              {chip.label}
            </span>
          ))}
        </div>

        {/* DIGITAL COPY NOTE */}

        <p
          className="pr-note pr-r"
          style={{ '--d': '1.2s' }}
        >
          <b>Note:</b> You will receive a digital copy only,
          not a hard copy.
        </p>
      </div>

      {/* TRUST AND BENEFITS SECTION */}

      <div className="pr-strip">
        <div className="pr-sweep" />

        <div className="pr-grid">
          {TRUST.map((item, index) => (
            <div
              className="pr-item pr-r"
              key={item.title}
              style={{
                '--d': `${1 + index * 0.14}s`,
              }}
            >
              <span className="pr-ic">
                {ICONS[item.icon]}
              </span>

              <div>
                <b>{item.title}</b>

                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
