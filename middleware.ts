import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/config";

const encoder = new TextEncoder();

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_STUDENT_PATHS = ["/student/login", "/student/generate-code"];

async function isValidToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, encoder.encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (PUBLIC_ADMIN_PATHS.includes(pathname)) return NextResponse.next();

    const token = request.cookies.get(SESSION_COOKIE.admin)?.value;
    const valid = await isValidToken(token, process.env.ADMIN_JWT_SECRET);
    if (!valid) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/student")) {
    if (PUBLIC_STUDENT_PATHS.includes(pathname)) return NextResponse.next();

    const token = request.cookies.get(SESSION_COOKIE.student)?.value;
    const valid = await isValidToken(token, process.env.STUDENT_JWT_SECRET);
    if (!valid) {
      const loginUrl = new URL("/student/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
