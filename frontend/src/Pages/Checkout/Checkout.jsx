
import React, { useState } from "react";
import "./Checkout.css";

const API_URL = "http://localhost:5000";

const MAIN_PRICE = 249;

const COMMUNITY_LINK =
  "https://chat.whatsapp.com/IiJgO7T7PhbApJ8IwuiWK7";

const ADDONS = [
  {
    id: "clinical",
    name: "Physiotherapy 111 Clinical Cases Handbook",
    description: "111 practical clinical cases.",
    price: 179,
    icon: "🩺",
  },

];

export default function Checkout() {
  const [communityJoined, setCommunityJoined] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [paying, setPaying] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadToken, setDownloadToken] = useState("");
  const [downloading, setDownloading] = useState(false);

  const addonTotal = ADDONS.reduce(
    (sum, addon) =>
      sum +
      (selectedAddons.includes(addon.id) ? addon.price : 0),
    0
  );

  const total = MAIN_PRICE + addonTotal;

  const toggleAddon = (id) => {
    setSelectedAddons((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!communityJoined) {
      alert("Please join the WhatsApp community first.");
      return;
    }

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
            addonIds: selectedAddons,
          }),
        }
      );

      const order = await response.json();

      if (!response.ok || !order.orderId || !order.keyId) {
        throw new Error(
          order.message || "Unable to create payment order."
        );
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Medical Notes",
        description: "BPT Revision E-Book and selected handbooks",
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

            if (!result.downloadToken) {
              throw new Error(
                "Payment was received, but the download token " +
                "was not returned. Please contact support. " +
                "Do not pay again."
              );
            }

            setDownloadToken(result.downloadToken);
            setDownloadReady(true);

            alert("Payment verified successfully!");
          } catch (error) {
            alert(
              error.message ||
              "Could not verify payment. Please contact support before retrying."
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

  const downloadPDF = async () => {
    if (!downloadToken || downloading) return;

    setDownloading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/payment/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: downloadToken,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
          result.message || "Unable to download the PDF."
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "physiotherapy-clinical-casebook.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        error.message ||
        "Download failed. Please contact support."
      );
    } finally {
      setDownloading(false);
    }
  };

  // Step 1: WhatsApp community
  if (!communityJoined) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <section className="checkout-card community-card">
            <div className="checkout-heading">
              <span className="checkout-tag">ONE QUICK STEP</span>
              <h1>Join Our Community</h1>
              <p>
                Join our WhatsApp community before continuing
                to your BPT Revision E-Book checkout.
              </p>
            </div>

            <div className="checkout-notice">
              <span>📚</span>
              <div>
                <strong>BPT Revision E-Book</strong>
                <p>PDF download after verified payment</p>
              </div>
              <strong>₹{MAIN_PRICE}</strong>
            </div>

            <a
              className="checkout-pay-button community-button"
              href={COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join WhatsApp Community
            </a>

            <label className="community-confirm">
              <input
                type="checkbox"
                checked={communityJoined}
                onChange={(event) =>
                  setCommunityJoined(event.target.checked)
                }
              />
              I've joined the WhatsApp community
            </label>

            <button
              type="button"
              className="checkout-pay-button"
              disabled={!communityJoined}
              onClick={() => setCommunityJoined(true)}
            >
              Continue to Checkout →
            </button>

            <p className="checkout-footer">
              Community membership is self-confirmed here.
            </p>
          </section>
        </div>
      </main>
    );
  }

  // Step 3: Payment verified, download PDF
  if (downloadReady) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <section className="checkout-card">
            <div className="checkout-heading">
              <span className="checkout-tag">
                PAYMENT VERIFIED
              </span>

              <h1>Your E-Book Is Ready!</h1>

              <p>
                Your payment has been verified successfully.
                Download your BPT Revision E-Book below.
              </p>
            </div>

            <button
              type="button"
              className="checkout-pay-button"
              onClick={downloadPDF}
              disabled={downloading}
            >
              {downloading
                ? "PREPARING DOWNLOAD..."
                : "⬇ Download Your PDF"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  // Step 2: Details and checkout
  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <button
          type="button"
          className="checkout-back"
          onClick={() => setCommunityJoined(false)}
        >
          ← Back to Community
        </button>

        <section className="checkout-card">
          <div className="checkout-heading">
            <span className="checkout-tag">SECURE CHECKOUT</span>
            <h1>Complete Your Order</h1>
            <p>
              Enter your details and select any optional handbooks.
            </p>
          </div>

          <div className="checkout-notice">
            <span>📘</span>
            <div>
              <strong>BPT Revision E-Book</strong>
              <p>Digital PDF · Instant access after verified payment</p>
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
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-email">Email Address</label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-phone">Mobile Number</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="checkout-addons">
              <h2>Complete Your Study Kit</h2>
              <p>Optional handbooks at a special price</p>

              {ADDONS.map((addon) => {
                const selected = selectedAddons.includes(addon.id);

                return (
                  <label
                    className={`checkout-addon ${
                      selected ? "selected" : ""
                    }`}
                    key={addon.id}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleAddon(addon.id)}
                    />

                    <span className="checkout-addon-icon">
                      {addon.icon}
                    </span>

                    <span className="checkout-addon-info">
                      <strong>{addon.name}</strong>
                      <small>{addon.description}</small>
                    </span>

                    <strong>₹{addon.price}</strong>
                  </label>
                );
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

              <div className="checkout-summary-row checkout-total">
                <strong>Total Amount</strong>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="checkout-pay-button"
              disabled={paying}
            >
              {paying
                ? "PROCESSING..."
                : `PAY SECURELY · ₹${total.toLocaleString("en-IN")}`}
            </button>

            <div className="checkout-security">
              🔒 Secure payment powered by Razorpay.
            </div>
          </form>
        </section>

        <p className="checkout-footer">
          © {new Date().getFullYear()} Medical Notes · Secure Checkout
        </p>
      </div>
    </main>
  );
}
