/**
 * Contact API client
 */
const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function submitContactEnquiry(payload) {
  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    const message =
      result.message ||
      (response.status === 502
        ? "Email delivery failed. Please try again shortly."
        : response.status === 503
          ? result.message ||
            "Email not configured on the server. Add RESEND_API_KEY in Vercel environment variables."
          : "Unable to send your enquiry. Please try again.");

    const error = new Error(message);
    error.status = response.status;
    error.errors = result.errors;
    throw error;
  }

  return result;
}
