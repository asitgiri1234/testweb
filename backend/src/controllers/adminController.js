/**
 * Host admin — login, dashboard, bookings, blocks, guest email.
 */
import { authenticateAdmin } from "../services/adminAuthService.js";
import { getAdminDashboard } from "../services/adminDashboardService.js";
import { sendHostMessageToGuest } from "../services/hostGuestEmailService.js";
import {
  createManualBlock,
  deleteManualBlock,
  listManualBlocksForAdmin,
} from "../services/manualBlockService.js";
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

export const dashboard = async (req, res, next) => {
  try {
    const data = await getAdminDashboard();
    return res.json({ success: true, ...data });
  } catch (err) {
    return next(err);
  }
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

export const emailGuest = async (req, res, next) => {
  try {
    const { subject, message } = req.body || {};
    const result = await sendHostMessageToGuest(
      req.params.id,
      { subject, message },
      req.admin.email,
    );

    return res.json({
      success: true,
      message: `Email sent to ${result.to}`,
      ...result,
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

export const listBlocks = async (req, res, next) => {
  try {
    const blocks = await listManualBlocksForAdmin();
    return res.json({ success: true, blocks });
  } catch (err) {
    return next(err);
  }
};

export const createBlock = async (req, res, next) => {
  try {
    const block = await createManualBlock(req.body, req.admin.email);
    return res.status(201).json({
      success: true,
      message: "Dates blocked on the website calendar.",
      block,
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

export const removeBlock = async (req, res, next) => {
  try {
    await deleteManualBlock(req.params.id);
    return res.json({
      success: true,
      message: "Block removed — dates are available again.",
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
