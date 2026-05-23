/**
 * Calendar availability API (Airbnb + website bookings merged).
 */
const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function fetchPropertyAvailability(propertySlug, options = {}) {
  const params = new URLSearchParams();
  if (options.refresh) {
    params.set("refresh", "1");
  }
  const query = params.toString();
  const response = await fetch(
    `${API_URL}/calendar/availability/${propertySlug}${query ? `?${query}` : ""}`,
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load availability");
  }

  return data;
}
