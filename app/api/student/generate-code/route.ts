import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function generateCode(): string {
  // 6-character alphanumeric code, uppercase, easy to read aloud.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const studentId = typeof body?.student_id === "string" ? body.student_id.trim() : "";

  if (!studentId) {
    return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
  }

  const rows = (await sql`
    SELECT id, fullname, access_code FROM students WHERE student_id = ${studentId}
  `) as { id: number; fullname: string; access_code: string | null }[];

  const student = rows[0];

  if (!student) {
    return NextResponse.json(
      { error: "Student ID not found in the system. Please contact the administrator." },
      { status: 404 }
    );
  }

  if (student.access_code) {
    return NextResponse.json({
      fullname: student.fullname,
      accessCode: student.access_code,
      alreadyGenerated: true,
    });
  }

  // Try a few times in case of a rare code collision (unique index on access_code).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      await sql`UPDATE students SET access_code = ${code} WHERE id = ${student.id}`;
      return NextResponse.json({ fullname: student.fullname, accessCode: code, alreadyGenerated: false });
    } catch (err: any) {
      if (!String(err?.message ?? "").includes("duplicate key")) {
        return NextResponse.json({ error: "Failed to generate code. Please try again." }, { status: 500 });
      }
      // else loop and try a new random code
    }
  }

  return NextResponse.json({ error: "Failed to generate a unique code. Please try again." }, { status: 500 });
}
