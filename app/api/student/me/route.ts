import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireStudent } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireStudent();
  if (guard instanceof NextResponse) return guard;

  const rows = (await sql`
    SELECT has_voted FROM students WHERE id = ${guard.dbId}
  `) as { has_voted: boolean }[];

  return NextResponse.json({
    fullname: guard.fullname,
    studentId: guard.studentId,
    hasVoted: rows[0]?.has_voted ?? false,
  });
}
