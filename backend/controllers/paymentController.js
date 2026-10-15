
import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Product prices in INR
const MAIN_PRICE = 249;

const ADDONS = {
  clinical: 179,
  xray: 179,
};

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { name, email, phone, addonIds = [] } = req.body;

    // Validate customer details
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof phone !== "string" ||
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid name, email and phone.",
      });
    }

    // Validate add-on selection
    if (
      !Array.isArray(addonIds) ||
      addonIds.some(
        (id) =>
          typeof id !== "string" ||
          !Object.hasOwn(ADDONS, id)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid add-on selection.",
      });
    }

    // Remove duplicate add-ons
    const uniqueIds = [...new Set(addonIds)];

    // Calculate amount in paise on the server
    const amount =
      (MAIN_PRICE +
        uniqueIds.reduce(
          (sum, id) => sum + ADDONS[id],
          0
        )) * 100;

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        product_id: "bpt-revision",
        addon_ids: uniqueIds.join(","),
        customer_name: name.trim().slice(0, 200),
        customer_email: email.trim().slice(0, 200),
        customer_phone: phone,
      },
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create payment order.",
    });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Validate payment response
    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing or invalid.",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      throw new Error("Razorpay environment variables are missing.");
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest();

    const receivedSignature = Buffer.from(
      razorpay_signature,
      "hex"
    );

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        receivedSignature,
        expectedSignature
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Fetch order and payment directly from Razorpay
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);

    // Confirm this is a valid product order
    if (
      order.id !== razorpay_order_id ||
      order.notes?.product_id !== "bpt-revision"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product order.",
      });
    }

    // Validate add-ons stored in the order
    const addonIds = (order.notes?.addon_ids || "")
      .split(",")
      .filter(Boolean);

    if (
      addonIds.some((id) => !Object.hasOwn(ADDONS, id)) ||
      new Set(addonIds).size !== addonIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order items.",
      });
    }

    // Calculate the expected amount independently
    const expectedAmount =
      (MAIN_PRICE +
        addonIds.reduce(
          (sum, id) => sum + ADDONS[id],
          0
        )) * 100;

    // Confirm amount, currency, order and captured status
    if (
      order.amount !== expectedAmount ||
      order.currency !== "INR" ||
      order.status === "cancelled" ||
      payment.order_id !== order.id ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not confirmed as captured.",
      });
    }

    // Payment verified — no PDF or download token
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not verify payment. Please contact support.",
    });
  }
};
