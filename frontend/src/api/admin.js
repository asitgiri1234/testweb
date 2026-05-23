/**
 * Host admin API — login, dashboard, bookings, blocks, guest email.
 */
const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "jr_admin_token";

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function adminFetch(path, options = {}) {
  const token = getAdminToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    setAdminToken(null);
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
}

export async function adminLogin(email, password) {
  const data = await adminFetch("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAdminToken(data.token);
  return data;
}

export async function adminLogout() {
  setAdminToken(null);
}

export async function fetchAdminSession() {
  if (!getAdminToken()) return null;
  return adminFetch("/admin/me");
}

export async function fetchAdminDashboard() {
  return adminFetch("/admin/dashboard");
}

export async function fetchAdminBookings(status = "active") {
  return adminFetch(`/admin/bookings?status=${encodeURIComponent(status)}`);
}

export async function cancelAdminBooking(bookingId, reason = "") {
  return adminFetch(`/admin/bookings/${bookingId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function emailAdminGuest(bookingId, { subject, message }) {
  return adminFetch(`/admin/bookings/${bookingId}/email`, {
    method: "POST",
    body: JSON.stringify({ subject, message }),
  });
}

export async function fetchAdminBlocks() {
  return adminFetch("/admin/blocks");
}

export async function createAdminBlock(payload) {
  return adminFetch("/admin/blocks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminBlock(blockId) {
  return adminFetch(`/admin/blocks/${blockId}`, {
    method: "DELETE",
  });
}

export const EMAIL_TEMPLATES = {
  checkin: {
    label: "Check-in details",
    subject: "Your upcoming stay — check-in information",
    message:
      "We are looking forward to welcoming you. Please reply to this email if you need directions, parking, or an adjusted arrival time. We will share exact check-in instructions closer to your date.",
  },
  thankyou: {
    label: "Thank you",
    subject: "Thank you for booking with us",
    message:
      "Thank you for choosing Joseph's Retreat. If you have any questions before your arrival, please reach out anytime.",
  },
};
