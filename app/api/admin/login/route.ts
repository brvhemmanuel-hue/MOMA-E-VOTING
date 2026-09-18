import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createAdminSession, setSessionCookie } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/config";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const admins = (await sql`SELECT id, username, password FROM admins WHERE username = ${username}`) as {
    id: number;
    username: string;
    password: string;
  }[];

  const admin = admins[0];
  const valid = admin ? await verifyPassword(password, admin.password) : false;

  if (!admin || !valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await createAdminSession(admin);
  const res = NextResponse.json({ username: admin.username });
  setSessionCookie(res, SESSION_COOKIE.admin, token);
  return res;
}
