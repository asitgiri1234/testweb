/**
 * Booking controller — Phase 3+ will handle validation, pricing, and Razorpay.
 */

export const createBooking = async (req, res) => {
  res.status(501).json({
    message: "Not implemented yet — Phase 3 will create a pending booking",
  });
};

export const verifyPayment = async (req, res) => {
  res.status(501).json({
    message:
      "Not implemented yet — Phase 4 will verify Razorpay signature securely",
  });
};

export const getBookingById = async (req, res) => {
  res.status(501).json({
    message: `Not implemented yet — Phase 4 will return booking: ${req.params.id}`,
  });
};
