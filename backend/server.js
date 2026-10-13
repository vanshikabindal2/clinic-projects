
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Razorpay from 'razorpay'
import crypto from 'crypto'

dotenv.config()

const app = express()
app.use(express.json())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
)

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Prices are controlled by the backend, not by the browser.
const MAIN_PRODUCT_PRICE = 249

const ADDONS = {
  clinical: 179,
  xray: 179,
}

// Demo storage for local development only.
// Use a database for production.
const pendingOrders = new Map()

app.get('/', (req, res) => {
  res.send('Razorpay backend is running')
})

app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { name, email, phone, addonIds = [] } = req.body

    if (
      !name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') ||
      !/^[6-9]\d{9}$/.test(phone || '')
    ) {
      return res.status(400).json({
        message: 'Please enter valid name, email and phone number.',
      })
    }

    if (
      !Array.isArray(addonIds) ||
      addonIds.some((id) => !Object.hasOwn(ADDONS, id))
    ) {
      return res.status(400).json({
        message: 'Invalid add-on selection.',
      })
    }

    const uniqueAddonIds = [...new Set(addonIds)]

    const addonTotal = uniqueAddonIds.reduce(
      (sum, id) => sum + ADDONS[id],
      0
    )

    const amount = (MAIN_PRODUCT_PRICE + addonTotal) * 100

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone,
        addon_ids: uniqueAddonIds.join(','),
      },
    })

    pendingOrders.set(order.id, {
      amount,
      currency: 'INR',
    })

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Create order error:', error.message)
    return res.status(500).json({
      message: 'Could not create payment order.',
    })
  }
})

app.post('/api/payment/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: 'Payment verification details are missing.',
      })
    }

    // Verify only orders created by this running server.
    const savedOrder = pendingOrders.get(razorpay_order_id)

    if (!savedOrder) {
      return res.status(400).json({
        message: 'Order not found or expired. Please retry checkout.',
      })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    const signatureBuffer = Buffer.from(razorpay_signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    const signatureIsValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer)

    if (!signatureIsValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature is invalid.',
      })
    }

    // Confirm payment details with Razorpay itself.
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== savedOrder.amount ||
      payment.currency !== savedOrder.currency ||
      payment.status !== 'captured'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment is not confirmed as captured.',
      })
    }

    pendingOrders.delete(razorpay_order_id)

    return res.json({
      success: true,
      message: 'Payment verified successfully.',
      paymentId: razorpay_payment_id,
    })
  } catch (error) {
    console.error('Payment verification error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Could not verify payment. Please contact support.',
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})