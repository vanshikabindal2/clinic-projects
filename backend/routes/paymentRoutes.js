import express from "express";

import {
  createOrder,
  verifyPayment,
  downloadPdf,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/download", downloadPdf);

export default router;
