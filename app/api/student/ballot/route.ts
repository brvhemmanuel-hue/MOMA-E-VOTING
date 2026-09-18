import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireStudent } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireStudent();
  if (guard instanceof NextResponse) return guard;

  const votedRows = (await sql`SELECT has_voted FROM students WHERE id = ${guard.dbId}`) as {
    has_voted: boolean;
  }[];

  if (votedRows[0]?.has_voted) {
    return NextResponse.json({ error: "You have already voted.", hasVoted: true }, { status: 403 });
  }

  const positions = (await sql`
    SELECT id, position_name, sort_order FROM positions ORDER BY sort_order ASC, id ASC
  `) as { id: number; position_name: string; sort_order: number }[];

  const candidates = (await sql`
    SELECT id, fullname, photo, position_id, manifesto FROM candidates ORDER BY id ASC
  `) as { id: number; fullname: string; photo: string | null; position_id: number; manifesto: string | null }[];

  const ballot = positions.map((position) => ({
    ...position,
    candidates: candidates.filter((c) => c.position_id === position.id),
  }));

  return NextResponse.json({ ballot });
}
