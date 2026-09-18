import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { parseCsv } from "@/lib/csv";

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("csv_file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Please attach a CSV file." }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV file is empty." }, { status: 400 });
  }

  // Skip header row if it looks like one (non-numeric-ish, matches known headers)
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const looksLikeHeader = header.includes("student_id") || header.includes("fullname");
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of dataRows) {
    if (row.length < 4) {
      skipped++;
      continue;
    }
    const [studentId, fullname, studentClass, password] = row.map((c) => c.trim());
    if (!studentId || !fullname || !studentClass || !password) {
      skipped++;
      continue;
    }

    try {
      const hashed = await hashPassword(password);
      await sql`
        INSERT INTO students (student_id, fullname, class, password)
        VALUES (${studentId}, ${fullname}, ${studentClass}, ${hashed})
      `;
      imported++;
    } catch (err: any) {
      skipped++;
      if (!String(err?.message ?? "").includes("duplicate key")) {
        errors.push(`Row for "${studentId}": ${err?.message ?? "unknown error"}`);
      }
    }
  }

  return NextResponse.json({
    message: `${imported} student(s) imported successfully. ${skipped} skipped (duplicates or invalid rows).`,
    imported,
    skipped,
    errors,
  });
}
