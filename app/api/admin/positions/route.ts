import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { Position } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const positions = (await sql`
    SELECT id, position_name, sort_order FROM positions ORDER BY sort_order ASC, id ASC
  `) as Position[];

  return NextResponse.json({ positions });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const name = typeof body?.position_name === "string" ? body.position_name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Position name is required." }, { status: 400 });
  }

  const [{ next_order }] = (await sql`
    SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM positions
  `) as { next_order: number }[];

  await sql`INSERT INTO positions (position_name, sort_order) VALUES (${name}, ${next_order})`;

  return NextResponse.json({ ok: true }, { status: 201 });
}
