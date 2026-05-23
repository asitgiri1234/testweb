/**
 * Host admin allowlist — only these emails may access /api/admin/*
 */
import crypto from "crypto";

const DEFAULT_ADMIN_EMAILS = [
  "joeljoseph2003871@gmail.com",
  "asitkg03@gmail.com",
];

const PASSWORD_SALT =
  process.env.ADMIN_PASSWORD_SALT?.trim() || "josephs-retreat-admin-v1";

/** scrypt hash of default password (override via ADMIN_PASSWORD in env). */
const DEFAULT_PASSWORD_HASH =
  "928595d8d24e603df672f8986bc31991ca8861850e5c6d3b09691b087b6bc1d00afbc7cc0d9965064f32b46d4614233f65656329d8e44abce5c61f53066359ea";

export function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return DEFAULT_ADMIN_EMAILS;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  return getAdminEmails().includes(normalized);
}

function hashPassword(password) {
  return crypto.scryptSync(String(password), PASSWORD_SALT, 64);
}

function getStoredPasswordHash() {
  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (plain) {
    return hashPassword(plain);
  }
  return Buffer.from(DEFAULT_PASSWORD_HASH, "hex");
}

export function verifyAdminPassword(password) {
  try {
    const attempt = hashPassword(password);
    const expected = getStoredPasswordHash();
    if (attempt.length !== expected.length) return false;
    return crypto.timingSafeEqual(attempt, expected);
  } catch {
    return false;
  }
}

export function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= 24) return secret;
  const fallback = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (fallback && fallback.length >= 24) {
    return `${fallback}-admin-session`;
  }
  return "josephs-retreat-dev-admin-secret-change-me";
}

export const ADMIN_SESSION_MS = 24 * 60 * 60 * 1000;
