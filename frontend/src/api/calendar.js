/**
 * Calendar availability API (Airbnb + website bookings merged).
 */
const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function fetchPropertyAvailability(propertySlug) {
  const response = await fetch(
    `${API_URL}/calendar/availability/${propertySlug}`,
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load availability");
  }

  return data;
}
