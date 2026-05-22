/**
 * Booking API — validates against merged Airbnb + website calendar.
 */
const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function createBooking(payload) {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Unable to create booking");
    error.status = response.status;
    error.code = data.code || data.error;
    error.status = response.status;
    error.conflict = data.conflict;
    throw error;
  }

  return data;
}
