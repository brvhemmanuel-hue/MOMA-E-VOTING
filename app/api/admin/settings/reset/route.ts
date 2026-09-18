import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  await sql`DELETE FROM votes`;
  await sql`UPDATE students SET has_voted = false`;

  return NextResponse.json({ ok: true, message: "All votes cleared. Students may vote again." });
}
