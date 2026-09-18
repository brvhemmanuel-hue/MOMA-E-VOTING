import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const students = (await sql`
    SELECT id, student_id, fullname, class, access_code, has_voted
    FROM students
    ORDER BY id DESC
  `) as Student[];

  return NextResponse.json({ students });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const studentId = typeof body?.student_id === "string" ? body.student_id.trim() : "";
  const fullname = typeof body?.fullname === "string" ? body.fullname.trim() : "";
  const studentClass = typeof body?.class === "string" ? body.class.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!studentId || !fullname || !studentClass || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const hashed = await hashPassword(password);

  try {
    await sql`
      INSERT INTO students (student_id, fullname, class, password)
      VALUES (${studentId}, ${fullname}, ${studentClass}, ${hashed})
    `;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    if (String(err?.message ?? "").includes("duplicate key")) {
      return NextResponse.json({ error: `Student ID "${studentId}" already exists.` }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to add student." }, { status: 500 });
  }
}
