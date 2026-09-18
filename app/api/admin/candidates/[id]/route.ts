import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteCandidatePhoto } from "@/lib/blob";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid candidate id." }, { status: 400 });
  }

  const rows = (await sql`SELECT photo FROM candidates WHERE id = ${id}`) as { photo: string | null }[];
  await sql`DELETE FROM candidates WHERE id = ${id}`;

  if (rows[0]?.photo) {
    await deleteCandidatePhoto(rows[0].photo);
  }

  return NextResponse.json({ ok: true });
}
