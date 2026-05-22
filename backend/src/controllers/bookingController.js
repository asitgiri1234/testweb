/**
 * Booking controller — validation, pricing, payment placeholder.
 */
import * as bookingService from "../services/bookingService.js";

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body);

    return res.status(201).json({
      success: true,
      message: "Booking created. Complete payment to confirm your reservation.",
      booking: {
        id: booking._id,
        property: booking.property,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights: booking.nights,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
      },
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code,
        conflict: err.conflict,
      });
    }
    return next(err);
  }
};

export const releaseBookingHold = async (req, res, next) => {
  try {
    const booking = await bookingService.releaseBookingHold(req.params.id);

    return res.json({
      success: true,
      message: "Hold released — these dates are available again.",
      booking: {
        id: booking._id,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
      },
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

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.json({ success: true, booking });
  } catch (err) {
    return next(err);
  }
};
