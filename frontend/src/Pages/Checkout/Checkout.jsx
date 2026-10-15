
import React, { useState } from "react";
import "./Checkout.css";

const API_URL = "https://clinic-projects-woad.vercel.app";

const MAIN_PRICE = 249;

const COMMUNITY_LINK =
  "https://chat.whatsapp.com/DvX2xpXodbLJGS1vq6NFb1";

export default function Checkout() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Only the main PDF is included.
  const total = MAIN_PRICE;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay could not load. Please refresh the page.");
      return;
    }

    setPaying(true);

    try {
      const response = await fetch(
        `${API_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone,
            addonIds: [],
          }),
        }
      );

      const order = await response.json();

      if (!response.ok || !order.orderId || !order.keyId) {
        throw new Error(
          order.message || "Unable to create payment order."
        );
      }

      // Prevent accidental mismatch between displayed price
      // and the amount returned by the backend.
      if (Number(order.amount) !== MAIN_PRICE * 100) {
        throw new Error(
          "The payment amount does not match ₹249. Please check the backend pricing."
        );
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Medical Notes",
        description: "BPT Revision E-Book",
        order_id: order.orderId,

        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone,
        },

        theme: {
          color: "#e6a32b",
        },

        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/api/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentResponse),
              }
            );

            const result = await verifyResponse.json();

            if (!verifyResponse.ok || !result.success) {
              throw new Error(
                result.message || "Payment verification failed."
              );
            }

            setPaymentVerified(true);
          } catch (error) {
            alert(
              error.message ||
                "Payment verification failed. Please contact support before retrying."
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (failure) => {
        setPaying(false);

        alert(
          failure.error?.description ||
            "Payment failed. Please check your payment status."
        );
      });

      razorpay.open();
    } catch (error) {
      setPaying(false);
      alert(error.message || "Unable to start payment.");
    }
  };

  // Show confirmation after successful payment verification.
  if (paymentVerified) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <section className="checkout-card community-card">
            <div className="checkout-heading">
              <span className="checkout-tag">
                PAYMENT VERIFIED
              </span>

              <h1>Payment Successful!</h1>

              <p>
                Thank you, {name}. Your payment has been
                verified successfully.
              </p>
            </div>

            <div className="checkout-notice">
              <span>🎉</span>

              <div>
                <strong>Your order is confirmed</strong>
                <p>Total paid: ₹{MAIN_PRICE}</p>
              </div>
            </div>

            <p>
              Your PDF is waiting for you! Join our WhatsApp
              community to receive updates about your study
              resources.
            </p>

            <a
              className="checkout-pay-button community-button"
              href={COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join WhatsApp Community →
            </a>

            <p className="checkout-footer">
              Thank you for choosing Medical Notes.
            </p>
          </section>
        </div>
      </main>
    );
  }

  // Checkout: main PDF only, priced at ₹249.
  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <section className="checkout-card">
          <div className="checkout-heading">
            <span className="checkout-tag">
              SECURE CHECKOUT
            </span>

            <h1>Complete Your Order</h1>

            <p>
              Enter your details to purchase your BPT Revision
              E-Book.
            </p>
          </div>

          <div className="checkout-notice">
            <span>📘</span>

            <div>
              <strong>BPT Revision E-Book</strong>
              <p>Digital study resource · PDF format</p>
            </div>

            <strong>₹{MAIN_PRICE}</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="checkout-fields">
              <div className="checkout-field">
                <label htmlFor="checkout-name">
                  Full Name
                </label>

                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-email">
                  Email Address
                </label>

                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-phone">
                  Mobile Number
                </label>

                <input
                  id="checkout-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="checkout-summary">
              <h2>Order Summary</h2>

              <div className="checkout-summary-row">
                <span>BPT Revision E-Book</span>
                <span>₹249</span>
              </div>

              <div className="checkout-summary-row checkout-total">
                <strong>Total Amount</strong>
                <strong>₹249</strong>
              </div>
            </div>

            <button
              type="submit"
              className="checkout-pay-button"
              disabled={paying}
            >
              {paying ? "PROCESSING..." : "PAY SECURELY · ₹249"}
            </button>

            <div className="checkout-security">
              🔒 Secure payment powered by Razorpay.
            </div>
          </form>
        </section>

        <p className="checkout-footer">
          © {new Date().getFullYear()} Medical Notes · Secure
          Checkout
        </p>
      </div>
    </main>
  );
}
