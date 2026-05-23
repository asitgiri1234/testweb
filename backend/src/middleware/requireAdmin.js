import { getTokenFromRequest, verifyAdminToken } from "../services/adminAuthService.js";

export function requireAdmin(req, res, next) {
  const token = getTokenFromRequest(req);
  const session = verifyAdminToken(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Admin authentication required",
      code: "ADMIN_UNAUTHORIZED",
    });
  }

  req.admin = session;
  return next();
}
