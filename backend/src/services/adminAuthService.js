/**
 * Admin session tokens (signed, no external JWT dependency).
 */
import crypto from "crypto";
import {
  ADMIN_SESSION_MS,
  getAdminSessionSecret,
  isAdminEmail,
  verifyAdminPassword,
} from "../config/adminConfig.js";

function base64urlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64urlDecode(value) {
  return Buffer.from(value, "base64url");
}

export function createAdminToken(email) {
  const payload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + ADMIN_SESSION_MS,
  };
  const body = base64urlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getAdminSessionSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = crypto
    .createHmac("sha256", getAdminSessionSecret())
    .update(body)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(body).toString("utf8"));
    if (!payload.email || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    if (!isAdminEmail(payload.email)) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function authenticateAdmin(email, password) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();

  if (!isAdminEmail(normalized)) {
    return { ok: false, message: "Invalid email or password" };
  }

  if (!verifyAdminPassword(password)) {
    return { ok: false, message: "Invalid email or password" };
  }

  return {
    ok: true,
    token: createAdminToken(normalized),
    email: normalized,
  };
}

export function getTokenFromRequest(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }

  return null;
}
