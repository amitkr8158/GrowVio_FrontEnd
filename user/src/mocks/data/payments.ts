// AUTO-GENERATED mock fixture data for local development.
// Regenerate via scripts/gen-fixtures.mjs (see mocked-data/README.md).
// Passwords here are PLAINTEXT ON PURPOSE — this is mock/dev-only data, never real credentials.

export const MOCK_PAYMENTS = [
  {
    "id": "pay_1",
    "userId": 602,
    "plan": "STARTER",
    "amountPaise": 14900,
    "currency": "INR",
    "status": "SUCCESS",
    "razorpayOrderId": "order_Starter001",
    "razorpayPaymentId": "pay_Starter001",
    "createdAt": "2026-03-11T08:05:00Z"
  },
  {
    "id": "pay_2",
    "userId": 603,
    "plan": "PREMIUM",
    "amountPaise": 29900,
    "currency": "INR",
    "status": "SUCCESS",
    "razorpayOrderId": "order_Premium001",
    "razorpayPaymentId": "pay_Premium001",
    "createdAt": "2025-09-12T07:00:00Z"
  },
  {
    "id": "pay_3",
    "userId": 604,
    "plan": "PRO",
    "amountPaise": 79900,
    "currency": "INR",
    "status": "SUCCESS",
    "razorpayOrderId": "order_Pro001",
    "razorpayPaymentId": "pay_Pro001",
    "createdAt": "2025-05-20T08:10:00Z"
  },
  {
    "id": "pay_4",
    "userId": 605,
    "plan": "PRO",
    "amountPaise": 79900,
    "currency": "INR",
    "status": "SUCCESS",
    "razorpayOrderId": "order_Pro002",
    "razorpayPaymentId": "pay_Pro002",
    "createdAt": "2025-02-01T08:10:00Z"
  }
] as const
