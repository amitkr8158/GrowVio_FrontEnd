import apiClient from './apiClient'
import type { RazorpayHandlerResponse, RazorpayFailureResponse } from '@/types'

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: RazorpayFailureResponse) => void): void;
}

interface RazorpayConstructor {
  new(options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

// ── Plan pricing ─────────────────────────────────────────────────────────────
// Plan IDs must match backend User.Plan enum: FREE | STARTER | PREMIUM | PRO

export const PLAN_PRICES: Record<string, number> = {
  STARTER: 149,
  PREMIUM: 299,
  PRO:     799,
}

export const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    priceMonthly: 149,
    features: ['All books · All 7 textual levels', 'Full gamification + XP', 'Quizzes, workbooks, notes'],
    popular: false,
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    priceMonthly: 299,
    features: ['Everything in Starter', 'Audio + video summaries (Hindi & English)', 'Priority support'],
    popular: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    priceMonthly: 799,
    features: ['Everything in Premium', 'AI RAG on 5 books/month', 'Upload your own PDFs', '2× XP multiplier'],
  },
]

// ── API calls ───────────────────────────────────────────────────────────────

export const paymentService = {
  createOrder: (plan: string, couponCode?: string) =>
    apiClient.post('/api/payments/create-order', { plan, couponCode }).then(r => r.data),

  verifyPayment: (data: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
    plan: string
  }) => apiClient.post(
    `/api/payments/verify?plan=${encodeURIComponent(data.plan)}`,
    { razorpayOrderId: data.razorpayOrderId, razorpayPaymentId: data.razorpayPaymentId, razorpaySignature: data.razorpaySignature },
  ).then(r => r.data),

  getSagaStatus: (sagaId: string) =>
    apiClient.get(`/api/payments/checkout/status/${sagaId}`).then(r => r.data),
}

// ── Razorpay modal helper ───────────────────────────────────────────────────

export function openRazorpayModal(
  orderData: { razorpayOrderId: string; keyId?: string; amountPaise: number; currency?: string; plan: string },
  user: { name?: string; email?: string },
) {
  return new Promise<{ razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }>(
    (resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Check that checkout.razorpay.com script is in index.html.'))
        return
      }

      const options = {
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amountPaise,
        currency: orderData.currency || 'INR',
        name: 'GrowVio',
        description: `${orderData.plan} Plan Subscription`,
        order_id: orderData.razorpayOrderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#7C3AED' },
        handler(response: RazorpayHandlerResponse) {
          resolve({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
        modal: {
          ondismiss() {
            reject(new Error('Payment cancelled by user'))
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response: RazorpayFailureResponse) => {
        reject(new Error(response.error?.description || 'Payment failed'))
      })
      rzp.open()
    },
  )
}

// ── Saga polling helper ─────────────────────────────────────────────────────

export async function pollSagaStatus(sagaId: string, maxAttempts = 12) {
  let delay = 1000
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(res => setTimeout(res, delay))
    const data = await paymentService.getSagaStatus(sagaId)
    if (data.completed) return data
    delay = Math.min(delay * 2, 8000)
  }
  throw new Error('Payment timed out — please check your account or contact support')
}
