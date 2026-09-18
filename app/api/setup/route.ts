import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

/**
 * Visit /api/setup?key=YOUR_SETUP_SECRET once after deploying to create
 * the default admin account. Safe to call repeatedly — it no-ops if an
 * admin already exists.
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!process.env.SETUP_SECRET || key !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized. Provide the correct ?key=SETUP_SECRET." }, { status: 401 });
  }

  const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM admins`) as { count: number }[];

  if (count > 0) {
    return NextResponse.json({ message: "Admin already exists. Installation skipped." });
  }

  const defaultUsername = "admin";
  const defaultPassword = "admin123";
  const hashed = await hashPassword(defaultPassword);

  await sql`INSERT INTO admins (username, password) VALUES (${defaultUsername}, ${hashed})`;

  return NextResponse.json({
    message: "Default admin account created. Please log in and change the password immediately.",
    username: defaultUsername,
    password: defaultPassword,
    warning: "Change this password right away from Admin > Settings.",
  });
}
