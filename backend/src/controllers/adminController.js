/**
 * Host admin — login, list bookings, cancel reservations.
 */
import { authenticateAdmin } from "../services/adminAuthService.js";
import {
  cancelBookingByHost,
  listBookingsForAdmin,
} from "../services/hostCancelService.js";

export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const result = authenticateAdmin(email, password);
  if (!result.ok) {
    return res.status(401).json({
      success: false,
      message: result.message,
    });
  }

  return res.json({
    success: true,
    token: result.token,
    email: result.email,
  });
};

export const me = async (req, res) => {
  return res.json({
    success: true,
    email: req.admin.email,
  });
};

export const listBookings = async (req, res, next) => {
  try {
    const status = req.query.status || "active";
    const bookings = await listBookingsForAdmin({ status });
    return res.json({ success: true, bookings });
  } catch (err) {
    return next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const booking = await cancelBookingByHost(
      req.params.id,
      req.admin.email,
      reason,
    );

    return res.json({
      success: true,
      message: "Booking cancelled — dates are available on the website calendar.",
      booking,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    return next(err);
  }
};
