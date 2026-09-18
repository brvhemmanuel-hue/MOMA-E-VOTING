import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const [[{ count: totalStudents }], [{ count: totalCandidates }], [{ count: totalPositions }], [{ count: totalVoted }]] =
    (await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM students`,
      sql`SELECT COUNT(*)::int AS count FROM candidates`,
      sql`SELECT COUNT(*)::int AS count FROM positions`,
      sql`SELECT COUNT(*)::int AS count FROM students WHERE has_voted = true`,
    ])) as [{ count: number }[], { count: number }[], { count: number }[], { count: number }[]];

  return NextResponse.json({
    totalStudents,
    totalCandidates,
    totalPositions,
    totalVoted,
  });
}
