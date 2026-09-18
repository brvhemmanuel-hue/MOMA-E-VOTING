import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "./config";

const encoder = new TextEncoder();

function getSecretKey(envVar: "ADMIN_JWT_SECRET" | "STUDENT_JWT_SECRET") {
  const secret = process.env[envVar];
  if (!secret) {
    throw new Error(`${envVar} is not set in the environment.`);
  }
  return encoder.encode(secret);
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export interface AdminSession extends JWTPayload {
  adminId: number;
  username: string;
  role: "admin";
}

export interface StudentSession extends JWTPayload {
  dbId: number;
  studentId: string;
  fullname: string;
  role: "student";
}

async function sign(payload: Record<string, unknown>, secretVar: "ADMIN_JWT_SECRET" | "STUDENT_JWT_SECRET") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey(secretVar));
}

async function verify<T extends JWTPayload>(
  token: string,
  secretVar: "ADMIN_JWT_SECRET" | "STUDENT_JWT_SECRET"
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(secretVar));
    return payload as T;
  } catch {
    return null;
  }
}

// ---------- Admin session ----------

export async function createAdminSession(admin: { id: number; username: string }) {
  return sign({ adminId: admin.id, username: admin.username, role: "admin" }, "ADMIN_JWT_SECRET");
}

export async function verifyAdminToken(token: string) {
  return verify<AdminSession>(token, "ADMIN_JWT_SECRET");
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get(SESSION_COOKIE.admin)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// ---------- Student session ----------

export async function createStudentSession(student: { id: number; student_id: string; fullname: string }) {
  return sign(
    { dbId: student.id, studentId: student.student_id, fullname: student.fullname, role: "student" },
    "STUDENT_JWT_SECRET"
  );
}

export async function verifyStudentToken(token: string) {
  return verify<StudentSession>(token, "STUDENT_JWT_SECRET");
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const token = cookies().get(SESSION_COOKIE.student)?.value;
  if (!token) return null;
  return verifyStudentToken(token);
}

// ---------- API route guards ----------
// Usage inside a Route Handler:
//   const guard = await requireAdmin();
//   if (guard instanceof NextResponse) return guard;
//   const session = guard; // AdminSession

export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return session;
}

export async function requireStudent(): Promise<StudentSession | NextResponse> {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return session;
}

// ---------- Cookie helpers (used inside Route Handlers) ----------

export function setSessionCookie(res: NextResponse, name: string, token: string) {
  res.cookies.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse, name: string) {
  res.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
