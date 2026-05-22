/**
 * Build Razorpay Checkout options from server /api/payment-config (never guess on the client).
 */
export function buildRazorpayCheckoutOptions({
  serverPaymentConfig,
  order,
  siteName,
  description,
  prefill,
  onSuccess,
  onDismiss,
}) {
  const key =
    order?.key_id || serverPaymentConfig?.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!key) {
    throw new Error("Payment gateway is not configured on the server.");
  }

  const base = {
    key,
    amount: order.amount,
    currency: order.currency,
    name: siteName,
    description,
    order_id: order.order_id,
    prefill,
    theme: { color: "#1c1917" },
    handler: onSuccess,
    modal: {
      ondismiss: () => {
        void Promise.resolve(onDismiss?.());
      },
    },
  };

  const mode = serverPaymentConfig?.checkout_mode;
  const serverOptions = serverPaymentConfig?.checkout_options || {};

  if (mode === "dashboard" && serverOptions.checkout_config_id) {
    return {
      ...base,
      checkout_config_id: serverOptions.checkout_config_id,
    };
  }

  if (serverOptions.method || serverOptions.config) {
    return {
      ...base,
      ...serverOptions,
    };
  }

  return base;
}
