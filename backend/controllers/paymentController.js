
import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";
import fs from "fs";
import path from "path";

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

// PDF path: backend/private-files/physiotherapy-clinical-casebook.pdf
const PDF_PATH = path.resolve(
  process.cwd(),
  "private-files",
  "physiotherapy-clinical-casebook.pdf"
);

console.log("PDF path configured:", PDF_PATH);

try {
  const stats = fs.statSync(PDF_PATH);
  console.log("PDF exists:", stats.isFile());
  console.log("PDF size:", stats.size, "bytes");
} catch (error) {
  console.error("PDF file check failed:", error.code, error.message);
}

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { name, email, phone, addonIds = [] } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof phone !== "string" ||
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid name, email and phone.",
      });
    }

    if (
      !Array.isArray(addonIds) ||
      addonIds.some((id) => !Object.hasOwn(ADDONS, id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid add-on selection.",
      });
    }

    const uniqueIds = [...new Set(addonIds)];

    const amount =
      (MAIN_PRICE +
        uniqueIds.reduce((sum, id) => sum + ADDONS[id], 0)) *
      100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        product_id: "bpt-revision",
        addon_ids: uniqueIds.join(","),
      },
    });

    return res.json({
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

// Verify payment and issue a secure download token
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing.",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is missing.");
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();

    let receivedSignature;

    try {
      receivedSignature = Buffer.from(razorpay_signature, "hex");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    // Confirm order and payment directly with Razorpay
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);

    if (
      order.id !== razorpay_order_id ||
      order.notes?.product_id !== "bpt-revision"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product order.",
      });
    }

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

    const expectedAmount =
      (MAIN_PRICE +
        addonIds.reduce((sum, id) => sum + ADDONS[id], 0)) *
      100;

    if (
      order.amount !== expectedAmount ||
      order.currency !== "INR" ||
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

    if (!process.env.DOWNLOAD_TOKEN_SECRET) {
      throw new Error("DOWNLOAD_TOKEN_SECRET is missing.");
    }

    // Create a token valid for 15 minutes
    const payload = Buffer.from(
      JSON.stringify({
        product: "bpt-revision",
        orderId: order.id,
        paymentId: payment.id,
        exp: Date.now() + 15 * 60 * 1000,
      })
    ).toString("base64url");

    const tokenSignature = crypto
      .createHmac("sha256", process.env.DOWNLOAD_TOKEN_SECRET)
      .update(payload)
      .digest("base64url");

    return res.json({
      success: true,
      paymentId: payment.id,
      downloadToken: `${payload}.${tokenSignature}`,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not verify payment.",
    });
  }
};

// Download PDF only after payment verification
export const downloadPdf = async (req, res) => {
  try {
    const { token } = req.body;

    if (typeof token !== "string" || !token) {
      return res.status(401).json({
        message: "Download token is missing.",
      });
    }

    if (!process.env.DOWNLOAD_TOKEN_SECRET) {
      throw new Error("DOWNLOAD_TOKEN_SECRET is missing.");
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return res.status(401).json({
        message: "Invalid download token.",
      });
    }

    const [payload, tokenSignature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.DOWNLOAD_TOKEN_SECRET)
      .update(payload)
      .digest();

    const receivedSignature = Buffer.from(tokenSignature, "base64url");

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return res.status(401).json({
        message: "Invalid download token signature.",
      });
    }

    let data;

    try {
      data = JSON.parse(
        Buffer.from(payload, "base64url").toString("utf8")
      );
    } catch {
      return res.status(401).json({
        message: "Invalid download token payload.",
      });
    }

    if (
      data.product !== "bpt-revision" ||
      typeof data.orderId !== "string" ||
      typeof data.paymentId !== "string" ||
      !Number.isFinite(data.exp) ||
      data.exp <= Date.now()
    ) {
      return res.status(401).json({
        message: "Download token is invalid or expired.",
      });
    }

    // Confirm captured payment again
    const payment = await razorpay.payments.fetch(data.paymentId);

    if (
      payment.order_id !== data.orderId ||
      payment.status !== "captured"
    ) {
      return res.status(403).json({
        message: "A verified captured payment is required.",
      });
    }

    // Check the PDF before streaming
    console.log("Requested PDF path:", PDF_PATH);

    let stats;

    try {
      stats = fs.statSync(PDF_PATH);
    } catch (error) {
      console.error("PDF stat error:", {
        code: error.code,
        path: error.path,
        message: error.message,
      });

      return res.status(404).json({
        message: "PDF file not found. Check backend/private-files folder.",
      });
    }

    if (!stats.isFile() || stats.size === 0) {
      return res.status(404).json({
        message: "PDF is empty or the path is not a file.",
      });
    }

    console.log("PDF size:", stats.size, "bytes");
    console.log("Starting PDF stream...");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Physiotherapy-Clinical-Casebook.pdf"'
    );
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Cache-Control", "no-store");

    const stream = fs.createReadStream(PDF_PATH);

    stream.on("error", (error) => {
      console.error("PDF stream error:", {
        code: error.code,
        path: error.path,
        message: error.message,
      });

      if (!res.headersSent) {
        res.status(500).json({
          message: "Could not read the PDF file.",
        });
      } else {
        res.destroy(error);
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Download PDF error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: error.message || "Could not download the PDF.",
      });
    }

    res.destroy(error);
  }
};
