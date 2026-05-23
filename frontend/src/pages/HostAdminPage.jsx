import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  EMAIL_TEMPLATES,
  adminLogin,
  adminLogout,
  cancelAdminBooking,
  createAdminBlock,
  deleteAdminBlock,
  emailAdminGuest,
  fetchAdminBlocks,
  fetchAdminBookings,
  fetchAdminDashboard,
  fetchAdminSession,
} from "../api/admin.js";
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

  const [pageTab, setPageTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [bookingTab, setBookingTab] = useState("active");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [blocks, setBlocks] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blockForm, setBlockForm] = useState({
    propertySlug: "amber-house",
    checkIn: "",
    checkOut: "",
    reason: "Maintenance",
  });
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const [emailBooking, setEmailBooking] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);

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

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setActionError("");
    try {
      const data = await fetchAdminDashboard();
      setDashboard(data);
      if (data.properties?.length && !blockForm.propertySlug) {
        setBlockForm((prev) => ({
          ...prev,
          propertySlug: data.properties[0].slug,
        }));
      }
    } catch (err) {
      setActionError(err.message);
      if (err.status === 401) setSessionEmail(null);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setActionError("");
    try {
      const data = await fetchAdminBookings(bookingTab);
      setBookings(data.bookings || []);
    } catch (err) {
      setActionError(err.message);
      if (err.status === 401) setSessionEmail(null);
    } finally {
      setBookingsLoading(false);
    }
  }, [bookingTab]);

  const loadBlocks = useCallback(async () => {
    setBlocksLoading(true);
    setActionError("");
    try {
      const data = await fetchAdminBlocks();
      setBlocks(data.blocks || []);
    } catch (err) {
      setActionError(err.message);
      if (err.status === 401) setSessionEmail(null);
    } finally {
      setBlocksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionEmail) return;
    if (pageTab === "overview") loadDashboard();
    if (pageTab === "bookings") loadBookings();
    if (pageTab === "blocks") loadBlocks();
  }, [sessionEmail, pageTab, loadDashboard, loadBookings, loadBlocks]);

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
    setDashboard(null);
    setBookings([]);
    setBlocks([]);
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
      if (pageTab === "overview") await loadDashboard();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const openEmailModal = (booking) => {
    setEmailBooking(booking);
    setEmailSubject(EMAIL_TEMPLATES.checkin.subject);
    setEmailMessage(EMAIL_TEMPLATES.checkin.message);
    setActionError("");
  };

  const closeEmailModal = () => {
    setEmailBooking(null);
    setEmailSubject("");
    setEmailMessage("");
  };

  const applyEmailTemplate = (key) => {
    const template = EMAIL_TEMPLATES[key];
    if (!template) return;
    setEmailSubject(template.subject);
    setEmailMessage(template.message);
  };

  const handleSendEmail = async (event) => {
    event.preventDefault();
    if (!emailBooking) return;

    setEmailSending(true);
    setActionError("");
    try {
      const result = await emailAdminGuest(emailBooking.id, {
        subject: emailSubject,
        message: emailMessage,
      });
      setActionMessage(result.message || "Email sent.");
      closeEmailModal();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setEmailSending(false);
    }
  };

  const handleCreateBlock = async (event) => {
    event.preventDefault();
    setBlockSubmitting(true);
    setActionError("");
    setActionMessage("");
    try {
      await createAdminBlock(blockForm);
      setActionMessage("Dates blocked on the website calendar.");
      setBlockForm((prev) => ({
        ...prev,
        checkIn: "",
        checkOut: "",
      }));
      await loadBlocks();
      if (pageTab === "overview") await loadDashboard();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleDeleteBlock = async (block) => {
    const confirmed = window.confirm(
      `Remove block for ${block.property?.title} (${formatDate(block.checkIn)} → ${formatDate(block.checkOut)})?`,
    );
    if (!confirmed) return;

    setActionError("");
    setActionMessage("");
    try {
      await deleteAdminBlock(block.id);
      setActionMessage("Block removed — dates are available again.");
      await loadBlocks();
      if (pageTab === "overview") await loadDashboard();
    } catch (err) {
      setActionError(err.message);
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

  const properties = dashboard?.properties || [
    { slug: "amber-house", title: "Amber House" },
    { slug: "rooftop-serenity", title: "Rooftop Serenity" },
  ];

  return (
    <section className="page host-admin">
      <div className="container host-admin__inner">
        <header className="host-admin__header">
          <div>
            <p className="host-admin__eyebrow">Host dashboard</p>
            <h1 className="host-admin__title">Joseph&apos;s Retreat</h1>
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

        <nav className="host-admin__tabs host-admin__tabs--main" role="tablist">
          {[
            ["overview", "Overview"],
            ["bookings", "Bookings"],
            ["blocks", "Block dates"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              className={
                pageTab === id
                  ? "host-admin__tab host-admin__tab--active"
                  : "host-admin__tab"
              }
              onClick={() => {
                setPageTab(id);
                setActionMessage("");
                setActionError("");
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {actionMessage && <p className="host-admin__success">{actionMessage}</p>}
        {actionError && <p className="host-admin__error">{actionError}</p>}

        {pageTab === "overview" && (
          <div className="host-admin__panel">
            {dashboardLoading ? (
              <p className="host-admin__muted">Loading summary…</p>
            ) : (
              <>
                <div className="host-admin__stats">
                  <article className="host-admin__stat-card">
                    <p className="host-admin__stat-label">Upcoming stays</p>
                    <p className="host-admin__stat-value">
                      {dashboard?.stats?.upcomingStays ?? 0}
                    </p>
                  </article>
                  <article className="host-admin__stat-card">
                    <p className="host-admin__stat-label">
                      Revenue ({dashboard?.monthLabel || "this month"})
                    </p>
                    <p className="host-admin__stat-value">
                      {formatMoney(dashboard?.stats?.revenueThisMonth)}
                    </p>
                  </article>
                  <article className="host-admin__stat-card">
                    <p className="host-admin__stat-label">All-time revenue</p>
                    <p className="host-admin__stat-value">
                      {formatMoney(dashboard?.stats?.revenueAllTime)}
                    </p>
                  </article>
                  <article className="host-admin__stat-card">
                    <p className="host-admin__stat-label">Active date blocks</p>
                    <p className="host-admin__stat-value">
                      {dashboard?.stats?.activeManualBlocks ?? 0}
                    </p>
                  </article>
                </div>

                <h2 className="host-admin__section-title">Next check-ins</h2>
                {!dashboard?.upcomingBookings?.length ? (
                  <p className="host-admin__muted">No upcoming confirmed stays.</p>
                ) : (
                  <ul className="host-admin__upcoming-list">
                    {dashboard.upcomingBookings.map((booking) => (
                      <li key={booking.id} className="host-admin__upcoming-item">
                        <div>
                          <strong>{booking.guestName}</strong>
                          <span className="host-admin__sub">
                            {" "}
                            · {booking.property?.title}
                          </span>
                          <br />
                          <span className="host-admin__sub">
                            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                          </span>
                        </div>
                        <div className="host-admin__upcoming-actions">
                          <button
                            type="button"
                            className="host-admin__link-btn"
                            onClick={() => openEmailModal(booking)}
                          >
                            Email
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {pageTab === "bookings" && (
          <div className="host-admin__panel">
            <div className="host-admin__tabs" role="tablist">
              {[
                ["active", "Active"],
                ["cancelled", "Cancelled"],
                ["all", "All"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  className={
                    bookingTab === id
                      ? "host-admin__tab host-admin__tab--active"
                      : "host-admin__tab"
                  }
                  onClick={() => setBookingTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

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
                          <span className="host-admin__sub">
                            → {formatDate(booking.checkOut)}
                          </span>
                        </td>
                        <td>{formatMoney(booking.totalAmount)}</td>
                        <td>
                          <span
                            className={`host-admin__badge host-admin__badge--${
                              booking.bookingStatus === "cancelled"
                                ? "cancelled"
                                : booking.paymentStatus === "paid"
                                  ? "paid"
                                  : "pending"
                            }`}
                          >
                            {statusLabel(booking)}
                          </span>
                        </td>
                        <td className="host-admin__actions-cell">
                          {booking.guestEmail && (
                            <button
                              type="button"
                              className="host-admin__link-btn"
                              onClick={() => openEmailModal(booking)}
                            >
                              Email
                            </button>
                          )}
                          {booking.bookingStatus !== "cancelled" && (
                            <button
                              type="button"
                              className="host-admin__cancel-btn"
                              disabled={cancellingId === booking.id}
                              onClick={() => handleCancel(booking)}
                            >
                              {cancellingId === booking.id ? "…" : "Cancel"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {pageTab === "blocks" && (
          <div className="host-admin__panel">
            <div className="host-admin__block-form-card">
              <h2 className="host-admin__section-title">Block dates (maintenance)</h2>
              <p className="host-admin__muted host-admin__form-hint">
                Blocked dates appear on the website booking calendar and exported Airbnb
                calendar feed.
              </p>
              <form className="host-admin__form host-admin__form--grid" onSubmit={handleCreateBlock}>
                <label>
                  Property
                  <select
                    value={blockForm.propertySlug}
                    onChange={(e) =>
                      setBlockForm((prev) => ({ ...prev, propertySlug: e.target.value }))
                    }
                  >
                    {properties.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Check-in
                  <input
                    type="date"
                    value={blockForm.checkIn}
                    onChange={(e) =>
                      setBlockForm((prev) => ({ ...prev, checkIn: e.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Check-out
                  <input
                    type="date"
                    value={blockForm.checkOut}
                    onChange={(e) =>
                      setBlockForm((prev) => ({ ...prev, checkOut: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="host-admin__form-full">
                  Reason
                  <input
                    type="text"
                    value={blockForm.reason}
                    onChange={(e) =>
                      setBlockForm((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="Maintenance, personal use…"
                  />
                </label>
                <div className="host-admin__form-full">
                  <button type="submit" className="btn" disabled={blockSubmitting}>
                    {blockSubmitting ? "Blocking…" : "Block dates"}
                  </button>
                </div>
              </form>
            </div>

            <h2 className="host-admin__section-title">Current blocks</h2>
            {blocksLoading ? (
              <p className="host-admin__muted">Loading blocks…</p>
            ) : blocks.length === 0 ? (
              <p className="host-admin__muted">No manual blocks set.</p>
            ) : (
              <div className="host-admin__table-wrap">
                <table className="host-admin__table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.map((block) => (
                      <tr key={block.id} className={block.isPast ? "host-admin__row--past" : ""}>
                        <td>{block.property?.title || "—"}</td>
                        <td>
                          {formatDate(block.checkIn)}
                          <br />
                          <span className="host-admin__sub">→ {formatDate(block.checkOut)}</span>
                        </td>
                        <td>{block.reason}</td>
                        <td>
                          <button
                            type="button"
                            className="host-admin__cancel-btn"
                            onClick={() => handleDeleteBlock(block)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <p className="host-admin__note">
          Calendar changes on the website are immediate. Airbnb may take a few hours to
          refresh from your exported calendar URL.
        </p>
      </div>

      {emailBooking && (
        <div className="host-admin__modal-backdrop" role="presentation">
          <div className="host-admin__modal" role="dialog" aria-labelledby="email-modal-title">
            <h2 id="email-modal-title" className="host-admin__section-title">
              Email {emailBooking.guestName}
            </h2>
            <p className="host-admin__sub">{emailBooking.guestEmail}</p>
            <div className="host-admin__template-btns">
              {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  className="host-admin__tab"
                  onClick={() => applyEmailTemplate(key)}
                >
                  {template.label}
                </button>
              ))}
            </div>
            <form className="host-admin__form" onSubmit={handleSendEmail}>
              <label>
                Subject
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                />
              </label>
              <label>
                Message
                <textarea
                  rows={6}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  required
                />
              </label>
              <div className="host-admin__modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeEmailModal}>
                  Close
                </button>
                <button type="submit" className="btn" disabled={emailSending}>
                  {emailSending ? "Sending…" : "Send email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default HostAdminPage;
