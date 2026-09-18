import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid position id." }, { status: 400 });
  }

  // ON DELETE CASCADE removes related candidates & votes automatically.
  await sql`DELETE FROM positions WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
