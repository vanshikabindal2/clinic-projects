import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import paymentRoutes from "./routes/paymentRoutes.js";
dotenv.config();

const app = express();

// ---------- CORS ----------
const allowedOrigins = [
  "http://localhost:5173",
  "https://clinic-projects-frontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const previewRegex =
  /^https:\/\/clinic-projects-frontend-[a-z0-9-]+\.vercel\.app$/;

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        previewRegex.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use("/api/payment", paymentRoutes);
// ---------- Environment validation ----------
if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET ||
  !process.env.DOWNLOAD_TOKEN_SECRET
) {
  console.warn(
    "Missing Razorpay or download-token environment variables."
  );
}

// ---------- Razorpay ----------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------- Product prices ----------
const MAIN_PRODUCT_PRICE = 249;

const ADDONS = {
  clinical: 179,
  xray: 179,
};

// ---------- Private PDF ----------
const PDF_PATH = path.join(
  process.cwd(),
  "private-files",
  "bpt-revision.pdf"
);

// ---------- Helpers ----------
function createDownloadToken(data) {
  const payload = Buffer.from(
    JSON.stringify(data)
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", process.env.DOWNLOAD_TOKEN_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function verifyDownloadToken(token) {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.DOWNLOAD_TOKEN_SECRET)
    .update(payload)
    .digest();

  let receivedSignature;

  try {
    receivedSignature = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }

  if (
    receivedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      receivedSignature,
      expectedSignature
    )
  ) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (
      data.product !== "bpt-revision" ||
      !Number.isFinite(data.exp) ||
      data.exp <= Date.now()
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

// ---------- Home ----------
app.get("/", (req, res) => {
  res.send("Razorpay backend is running");
});

// ---------- Create order ----------
app.post("/api/payment/create-order", async (req, res) => {
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
        message: "Please enter valid name, email and phone number.",
      });
    }

    if (
      !Array.isArray(addonIds) ||
      addonIds.some(
        (id) =>
          typeof id !== "string" ||
          !Object.hasOwn(ADDONS, id)
      )
    ) {
      return res.status(400).json({
        message: "Invalid add-on selection.",
      });
    }

    const uniqueAddonIds = [...new Set(addonIds)];

    const addonTotal = uniqueAddonIds.reduce(
      (sum, id) => sum + ADDONS[id],
      0
    );

    const amount = (MAIN_PRODUCT_PRICE + addonTotal) * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        product_id: "bpt-revision",
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone,
        addon_ids: uniqueAddonIds.join(","),
      },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error?.message || error);

    return res.status(500).json({
      message: "Could not create payment order.",
    });
  }
});

// ---------- Verify payment ----------
app.post("/api/payment/verify", async (req, res) => {
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
        message: "Payment verification details are missing.",
      });
    }

    // 1. Verify Razorpay signature.
    const body =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest();

    let receivedSignature;

    try {
      receivedSignature = Buffer.from(
        razorpay_signature,
        "hex"
      );
    } catch {
      receivedSignature = Buffer.alloc(0);
    }

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        receivedSignature,
        expectedSignature
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature is invalid.",
      });
    }

    // 2. Fetch the order and payment directly from Razorpay.
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);

    // 3. Confirm this is an order for our product.
    if (
      order.id !== razorpay_order_id ||
      order.notes?.product_id !== "bpt-revision"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order is not valid for this product.",
      });
    }

    // 4. Recalculate the expected price on the server.
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
      (
        MAIN_PRODUCT_PRICE +
        addonIds.reduce((sum, id) => sum + ADDONS[id], 0)
      ) * 100;

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

    // 5. Create a signed download token valid for 15 minutes.
    // Only issue it after payment verification succeeds.
    const downloadToken = createDownloadToken({
      product: "bpt-revision",
      orderId: order.id,
      paymentId: payment.id,
      exp: Date.now() + 15 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: payment.id,
      downloadToken,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error?.message || error
    );

    return res.status(500).json({
      success: false,
      message: "Could not verify payment. Please contact support.",
    });
  }
});

// ---------- Secure PDF download ----------
app.post("/api/payment/download", async (req, res) => {
  try {
    const { token } = req.body;

    const tokenData = verifyDownloadToken(token);

    if (!tokenData) {
      return res.status(401).json({
        message: "Download link is invalid or expired.",
      });
    }

    // Check the payment status again with Razorpay.
    const payment = await razorpay.payments.fetch(
      tokenData.paymentId
    );

    if (
      payment.order_id !== tokenData.orderId ||
      payment.status !== "captured"
    ) {
      return res.status(403).json({
        message: "A verified payment is required.",
      });
    }

    if (!fs.existsSync(PDF_PATH)) {
      console.error("PDF file not found:", PDF_PATH);

      return res.status(404).json({
        message: "The PDF is not available on the server yet.",
      });
    }

    return res.download(
      PDF_PATH,
      "BPT-Revision-Ebook.pdf",
      (error) => {
        if (error && !res.headersSent) {
          console.error("PDF download error:", error.message);
          res.status(500).end("Could not download the PDF.");
        }
      }
    );
  } catch (error) {
    console.error("Download error:", error?.message || error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Could not process the download.",
      });
    }
  }
});

// ---------- Server ----------
const PORT = process.env.PORT || 5000;

// Local development only. Vercel uses the exported app.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

export default app;
