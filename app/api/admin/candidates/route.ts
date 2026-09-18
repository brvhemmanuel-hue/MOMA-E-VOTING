import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { uploadCandidatePhoto, PhotoUploadError } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const candidates = (await sql`
    SELECT c.id, c.fullname, c.photo, c.position_id, c.manifesto, p.position_name
    FROM candidates c
    JOIN positions p ON p.id = c.position_id
    ORDER BY p.sort_order ASC, p.id ASC, c.id ASC
  `) as any[];

  return NextResponse.json({ candidates });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const fullname = String(formData.get("fullname") ?? "").trim();
  const positionId = Number(formData.get("position_id"));
  const manifesto = String(formData.get("manifesto") ?? "").trim();
  const photoFile = formData.get("photo");

  if (!fullname || !Number.isInteger(positionId)) {
    return NextResponse.json({ error: "Full name and position are required." }, { status: 400 });
  }

  let photoUrl: string | null = null;
  if (photoFile instanceof File && photoFile.size > 0) {
    try {
      photoUrl = await uploadCandidatePhoto(photoFile);
    } catch (err) {
      if (err instanceof PhotoUploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to upload photo." }, { status: 500 });
    }
  }

  await sql`
    INSERT INTO candidates (fullname, position_id, manifesto, photo)
    VALUES (${fullname}, ${positionId}, ${manifesto}, ${photoUrl})
  `;

  return NextResponse.json({ ok: true }, { status: 201 });
}
