/**
 * Razorpay checkout settings — single source of truth for the frontend.
 * Dashboard Payment Configuration (checkout_config_id) is validated via a test order.
 */
import {
  getCheckoutConfigId,
  getRazorpayClient,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "../config/razorpay.js";

const METHOD_LABELS = {
  upi: "UPI",
  card: "Cards",
  cards: "Cards",
  netbanking: "Netbanking",
  wallet: "Wallets",
};

let validationCache = null;
const CACHE_MS = 5 * 60 * 1000;

function getRazorpayKeyMode(keyId) {
  if (!keyId) return null;
  if (keyId.startsWith("rzp_live_")) return "live";
  if (keyId.startsWith("rzp_test_")) return "test";
  return "unknown";
}

function parsePaymentMethodLabels() {
  const raw = process.env.RAZORPAY_PAYMENT_METHODS?.trim();
  if (!raw) {
    return ["UPI", "Cards", "Netbanking", "Wallets"];
  }
  return raw
    .split(",")
    .map((part) => METHOD_LABELS[part.trim().toLowerCase()] || part.trim())
    .filter(Boolean);
}

/** Runtime fallback when no dashboard config ID (hide EMI / Pay Later). */
export function getRuntimeCheckoutOverrides() {
  return {
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
      emi: false,
      paylater: false,
    },
    config: {
      display: {
        hide: [
          { method: "emi" },
          { method: "paylater" },
          { method: "cardless_emi" },
        ],
        sequence: ["block.upi", "block.card", "block.netbanking", "block.wallet"],
        preferences: { show_default_blocks: false },
      },
    },
  };
}

async function validateDashboardConfig(checkoutConfigId) {
  const now = Date.now();
  if (
    validationCache &&
    validationCache.configId === checkoutConfigId &&
    now - validationCache.at < CACHE_MS
  ) {
    return validationCache.result;
  }

  try {
    const razorpay = getRazorpayClient();
    await razorpay.orders.create({
      amount: 100,
      currency: "INR",
      receipt: `cfg_chk_${now}`.slice(0, 40),
      checkout_config_id: checkoutConfigId,
    });
    const result = { valid: true };
    validationCache = { configId: checkoutConfigId, at: now, result };
    return result;
  } catch (err) {
    const result = {
      valid: false,
      error:
        err.error?.description ||
        err.message ||
        "Checkout configuration could not be loaded from Razorpay.",
    };
    validationCache = { configId: checkoutConfigId, at: now, result };
    return result;
  }
}

/**
 * Full checkout setup for the website — frontend must use this only (not VITE overrides).
 */
export async function getCheckoutSettingsForWebsite() {
  if (!isRazorpayConfigured()) {
    return {
      configured: false,
      key_id: null,
      key_mode: null,
      checkout_mode: null,
      checkout_config_id: null,
      payment_methods: [],
      checkout_ready: false,
      message: "Razorpay is not configured on the server.",
    };
  }

  const keyId = getRazorpayKeyId();
  const keyMode = getRazorpayKeyMode(keyId);
  const checkoutConfigId = getCheckoutConfigId();
  const paymentMethods = parsePaymentMethodLabels();

  if (!checkoutConfigId) {
    const runtime = getRuntimeCheckoutOverrides();
    return {
      configured: true,
      key_id: keyId,
      key_mode: keyMode,
      checkout_mode: "runtime",
      checkout_config_id: null,
      payment_methods: paymentMethods,
      checkout_ready: true,
      checkout_options: runtime,
      message: "Using built-in checkout settings (no dashboard config ID).",
    };
  }

  const validation = await validateDashboardConfig(checkoutConfigId);

  return {
    configured: true,
    key_id: keyId,
    key_mode: keyMode,
    checkout_mode: "dashboard",
    checkout_config_id: checkoutConfigId,
    payment_methods: paymentMethods,
    checkout_ready: validation.valid,
    checkout_options: {
      checkout_config_id: checkoutConfigId,
    },
    config_validation: validation,
    message: validation.valid
      ? "Using your Razorpay Dashboard payment configuration."
      : validation.error,
    hint: validation.valid
      ? null
      : `Ensure config ${checkoutConfigId} was created in Razorpay ${keyMode?.toUpperCase() || ""} mode (same as API keys).`,
  };
}
