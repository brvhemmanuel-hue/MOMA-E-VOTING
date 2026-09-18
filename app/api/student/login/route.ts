import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createStudentSession, setSessionCookie } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/config";
import type { Student } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const studentId = typeof body?.student_id === "string" ? body.student_id.trim() : "";
  const accessCode = typeof body?.access_code === "string" ? body.access_code.trim().toUpperCase() : "";

  if (!studentId || !accessCode) {
    return NextResponse.json({ error: "Student ID and access code are required." }, { status: 400 });
  }

  const rows = (await sql`
    SELECT id, student_id, fullname, class, access_code, has_voted
    FROM students
    WHERE student_id = ${studentId} AND access_code = ${accessCode}
  `) as Student[];

  const student = rows[0];

  if (!student) {
    return NextResponse.json(
      { error: "Invalid Student ID or Access Code. Please generate a code first." },
      { status: 401 }
    );
  }

  const token = await createStudentSession(student);
  const res = NextResponse.json({ fullname: student.fullname, hasVoted: student.has_voted });
  setSessionCookie(res, SESSION_COOKIE.student, token);
  return res;
}
