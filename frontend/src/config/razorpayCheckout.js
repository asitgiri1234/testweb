/**
 * Razorpay Standard Checkout — payment method visibility.
 * @see https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/
 */

/** Allowed methods only (no EMI, Pay Later, or cardless EMI). */
export const RAZORPAY_CHECKOUT_SEQUENCE = [
  "block.upi",
  "block.card",
  "block.netbanking",
  "block.wallet",
];

export const razorpayCheckoutConfig = {
  display: {
    hide: [
      { method: "emi" },
      { method: "paylater" },
      { method: "cardless_emi" },
    ],
    sequence: RAZORPAY_CHECKOUT_SEQUENCE,
    preferences: {
      show_default_blocks: false,
    },
  },
};

/** Legacy flags — used together with config.display for older checkout builds. */
export const razorpayCheckoutMethods = {
  upi: true,
  card: true,
  netbanking: true,
  wallet: true,
  emi: false,
  paylater: false,
};
