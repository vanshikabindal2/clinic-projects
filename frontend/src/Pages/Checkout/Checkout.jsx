import React, { useState } from 'react'
import './Checkout.css'

const MAIN_PRICE = 249

const ADDONS = [
  {
    id: 'clinical',
    name: 'Physiotherapy 111 Clinical Cases Handbook',
    description:
      '111 practical clinical cases covering assessment, treatment and rehabilitation.',
    price: 179,
    icon: '🩺',
  },
  {
    id: 'xray',
    name: 'X-Ray Interpretation Handbook',
    description:
      'Learn X-ray interpretation, fractures and important clinical points.',
    price: 179,
    icon: '🩻',
  },
]

const Checkout = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedAddons, setSelectedAddons] = useState([])
  const [paying, setPaying] = useState(false)

  const addonTotal = ADDONS.reduce((total, addon) => {
    return selectedAddons.includes(addon.id)
      ? total + addon.price
      : total
  }, 0)

  const total = MAIN_PRICE + addonTotal

  const toggleAddon = (addonId) => {
    setSelectedAddons((previous) =>
      previous.includes(addonId)
        ? previous.filter((id) => id !== addonId)
        : [...previous, addonId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Please enter your full name.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.')
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!window.Razorpay) {
      alert(
        'Razorpay checkout could not load. Please refresh the page and try again.'
      )
      return
    }

    setPaying(true)

    try {
      // Create the payment order through the backend
      const response = await fetch(
        'https://clinic-projects-woad.vercel.app/api/payment/create-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone,
            addonIds: selectedAddons,
          }),
        }
      )

      const order = await response.json()

      if (!response.ok) {
        throw new Error(order.message || 'Unable to create payment order.')
      }

      // Razorpay checkout settings
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Medical Notes',
        description: 'BPT Revision E-Book and selected handbooks',
        order_id: order.orderId,

        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone,
        },

        theme: {
          color: '#e6a32b',
        },

        // Verify payment on the backend
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              'https://clinic-projects-woad.vercel.app/api/payment/verify',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentResponse),
              }
            )

            const result = await verifyResponse.json()

            if (!verifyResponse.ok || !result.success) {
              throw new Error(
                result.message || 'Payment verification failed.'
              )
            }

            alert(
              'Payment successful! Your payment ID is: ' +
                result.paymentId
            )
          } catch (error) {
            alert(
              error.message +
                ' If money was deducted, please contact support before paying again.'
            )
          } finally {
            setPaying(false)
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false)
          },
        },
      }

      const checkout = new window.Razorpay(options)

      checkout.on('payment.failed', (failure) => {
        setPaying(false)

        alert(
          failure.error?.description ||
            'Payment failed. Please try again.'
        )
      })

      checkout.open()
    } catch (error) {
      setPaying(false)
      alert(error.message || 'Unable to start payment.')
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button
          type="button"
          className="checkout-back"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <div className="checkout-card">
          <div className="checkout-heading">
            <span className="checkout-tag">SECURE CHECKOUT</span>

            <h1>Complete Your Order</h1>

            <p>
              Enter your details below to get your BPT revision e-book.
            </p>
          </div>

          <div className="checkout-notice">
            <span>📘</span>
            <div>
              <strong>BPT Revision E-Book</strong>
              <p>Digital PDF · Instant access after successful payment</p>
            </div>
            <strong>₹{MAIN_PRICE}</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="checkout-fields">
              <div className="checkout-field">
                <label htmlFor="checkout-name">Full Name</label>
                <input
                  id="checkout-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-email">Email Address</label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-phone">Mobile Number</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="checkout-addons">
              <div className="checkout-section-heading">
                <div>
                  <h2>Complete Your Study Kit</h2>
                  <p>Optional handbooks at a special price</p>
                </div>
                <span>OPTIONAL</span>
              </div>

              {ADDONS.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id)

                return (
                  <label
                    className={`checkout-addon ${
                      isSelected ? 'selected' : ''
                    }`}
                    key={addon.id}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAddon(addon.id)}
                    />

                    <span className="checkout-addon-icon">
                      {addon.icon}
                    </span>

                    <span className="checkout-addon-info">
                      <strong>{addon.name}</strong>
                      <small>{addon.description}</small>
                      <span className="checkout-addon-action">
                        {isSelected ? '✓ Added to your order' : '+ Add handbook'}
                      </span>
                    </span>

                    <span className="checkout-addon-price">
                      ₹{addon.price}
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="checkout-summary">
              <h2>Order Summary</h2>

              <div className="checkout-summary-row">
                <span>BPT Revision E-Book</span>
                <span>₹{MAIN_PRICE}</span>
              </div>

              {ADDONS.filter((addon) =>
                selectedAddons.includes(addon.id)
              ).map((addon) => (
                <div
                  className="checkout-summary-row"
                  key={addon.id}
                >
                  <span>{addon.name}</span>
                  <span>₹{addon.price}</span>
                </div>
              ))}

              <div className="checkout-summary-row">
                <span>Add-ons subtotal</span>
                <span>₹{addonTotal}</span>
              </div>

              <div className="checkout-summary-row checkout-total">
                <strong>Total Amount</strong>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="checkout-pay-button"
              disabled={paying}
            >
              {paying
                ? 'PROCESSING...'
                : `PAY SECURELY · ₹${total.toLocaleString('en-IN')}`}
            </button>

            <div className="checkout-security">
              <span>🔒</span>
              <p>
                Secure payment powered by Razorpay. Your payment details
                are processed securely.
              </p>
            </div>
          </form>

          <div className="checkout-benefits">
            <div>
              <span>⚡</span>
              <p>
                <strong>Instant Access</strong>
                <small>Digital PDF delivery</small>
              </p>
            </div>

            <div>
              <span>📱</span>
              <p>
                <strong>Study Anywhere</strong>
                <small>Phone, tablet or laptop</small>
              </p>
            </div>

            <div>
              <span>📚</span>
              <p>
                <strong>Quick Revision</strong>
                <small>Made for exam preparation</small>
              </p>
            </div>
          </div>
        </div>

        <p className="checkout-footer">
          © {new Date().getFullYear()} Medical Notes · Secure Checkout
        </p>
      </div>
    </div>
  )
}

export default Checkout
