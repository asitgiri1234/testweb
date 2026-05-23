/**
 * Host admin API — login, bookings, cancel.
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

export async function fetchAdminBookings(status = "active") {
  return adminFetch(`/admin/bookings?status=${encodeURIComponent(status)}`);
}

export async function cancelAdminBooking(bookingId, reason = "") {
  return adminFetch(`/admin/bookings/${bookingId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
