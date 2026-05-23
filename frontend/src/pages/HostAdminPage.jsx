import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminLogin,
  adminLogout,
  cancelAdminBooking,
  fetchAdminBookings,
  fetchAdminSession,
} from "../api/admin.js";
import "./HostAdminPage.css";
import "./HostAdminPage.css";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function statusLabel(booking) {
  if (booking.bookingStatus === "cancelled") return "Cancelled";
  if (booking.paymentStatus === "paid") return "Confirmed";
  if (booking.paymentStatus === "pending") return "Pending payment";
  return booking.bookingStatus;
}

function HostAdminPage() {
  const [sessionEmail, setSessionEmail] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [tab, setTab] = useState("active");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const session = await fetchAdminSession();
        if (!cancelled && session?.email) {
          setSessionEmail(session.email);
        }
      } catch {
        if (!cancelled) setSessionEmail(null);
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setActionError("");
    try {
      const data = await fetchAdminBookings(tab);
      setBookings(data.bookings || []);
    } catch (err) {
      setActionError(err.message);
      if (err.status === 401) setSessionEmail(null);
    } finally {
      setBookingsLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (sessionEmail) loadBookings();
  }, [sessionEmail, loadBookings]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginSubmitting(true);
    setLoginError("");
    try {
      const result = await adminLogin(email.trim(), password);
      setSessionEmail(result.email);
      setPassword("");
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setSessionEmail(null);
    setBookings([]);
  };

  const handleCancel = async (booking) => {
    const nights = `${formatDate(booking.checkIn)} → ${formatDate(booking.checkOut)}`;
    const confirmed = window.confirm(
      `Cancel booking for ${booking.guestName} (${nights})?\n\nThis frees the dates on the website calendar immediately.`,
    );
    if (!confirmed) return;

    const reason = window.prompt(
      "Optional message for the guest (leave blank for default):",
      "",
    );
    if (reason === null) return;

    setCancellingId(booking.id);
    setActionError("");
    setActionMessage("");
    try {
      await cancelAdminBooking(booking.id, reason);
      setActionMessage("Booking cancelled — dates are available again.");
      await loadBookings();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loadingSession) {
    return (
      <section className="page host-admin">
        <div className="container host-admin__inner">Loading…</div>
      </section>
    );
  }

  if (!sessionEmail) {
    return (
      <section className="page host-admin">
        <div className="container host-admin__inner host-admin__login-wrap">
          <Link to="/" className="host-admin__back">
            ← Back to site
          </Link>
          <div className="host-admin__login-card">
            <p className="host-admin__eyebrow">Host access</p>
            <h1 className="host-admin__title">Sign in</h1>
            <form className="host-admin__form" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {loginError && <p className="host-admin__error">{loginError}</p>}
              <button type="submit" className="btn" disabled={loginSubmitting}>
                {loginSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page host-admin">
      <div className="container host-admin__inner">
        <header className="host-admin__header">
          <div>
            <p className="host-admin__eyebrow">Host dashboard</p>
            <h1 className="host-admin__title">Bookings</h1>
            <p className="host-admin__signed-in">Signed in as {sessionEmail}</p>
          </div>
          <div className="host-admin__header-actions">
            <Link to="/" className="btn btn-outline">
              View site
            </Link>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        <div className="host-admin__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={tab === "active" ? "host-admin__tab host-admin__tab--active" : "host-admin__tab"}
            onClick={() => setTab("active")}
          >
            Upcoming & active
          </button>
          <button
            type="button"
            role="tab"
            className={tab === "cancelled" ? "host-admin__tab host-admin__tab--active" : "host-admin__tab"}
            onClick={() => setTab("cancelled")}
          >
            Cancelled
          </button>
          <button
            type="button"
            role="tab"
            className={tab === "all" ? "host-admin__tab host-admin__tab--active" : "host-admin__tab"}
            onClick={() => setTab("all")}
          >
            All
          </button>
        </div>

        {actionMessage && <p className="host-admin__success">{actionMessage}</p>}
        {actionError && <p className="host-admin__error">{actionError}</p>}

        {bookingsLoading ? (
          <p className="host-admin__muted">Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <p className="host-admin__muted">No bookings in this view.</p>
        ) : (
          <div className="host-admin__table-wrap">
            <table className="host-admin__table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Guest</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.property?.title || "—"}</td>
                    <td>
                      <strong>{booking.guestName}</strong>
                      <br />
                      <span className="host-admin__sub">{booking.guestEmail}</span>
                    </td>
                    <td>
                      {formatDate(booking.checkIn)}
                      <br />
                      <span className="host-admin__sub">→ {formatDate(booking.checkOut)}</span>
                    </td>
                    <td>{formatMoney(booking.totalAmount)}</td>
                    <td>
                      <span
                        className={`host-admin__badge host-admin__badge--${booking.bookingStatus === "cancelled" ? "cancelled" : booking.paymentStatus === "paid" ? "paid" : "pending"}`}
                      >
                        {statusLabel(booking)}
                      </span>
                    </td>
                    <td>
                      {booking.bookingStatus !== "cancelled" && (
                        <button
                          type="button"
                          className="host-admin__cancel-btn"
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancel(booking)}
                        >
                          {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="host-admin__note">
          Cancelling frees dates on the website calendar right away. Airbnb may take a few hours
          to reflect changes from the exported calendar.
        </p>
      </div>
    </section>
  );
}

export default HostAdminPage;
