import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

const COOKIE_NAME = "mudalogic_admin_session";
const SESSION_DAYS = 7;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || "mudalogic-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string) {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'")
    .get<{ value: string }>();
  if (!row) return false;
  return bcrypt.compareSync(password, row.value);
}

export async function setAdminPassword(newPassword: string) {
  const hash = bcrypt.hashSync(newPassword, 10);
  await db
    .prepare(
      "INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(hash);
}
