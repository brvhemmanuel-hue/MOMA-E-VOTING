import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/config";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res, SESSION_COOKIE.admin);
  return res;
}
