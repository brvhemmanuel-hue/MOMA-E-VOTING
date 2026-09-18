import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireStudent } from "@/lib/auth";

interface IncomingVote {
  position_id: number;
  candidate_id: number;
  vote_type: "standard" | "yes" | "no";
}

export async function POST(request: NextRequest) {
  const guard = await requireStudent();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const votes: IncomingVote[] = Array.isArray(body?.votes) ? body.votes : [];

  if (votes.length === 0) {
    return NextResponse.json({ error: "No votes were submitted." }, { status: 400 });
  }

  // Re-check has_voted (defence against double submission / replay).
  const studentRows = (await sql`SELECT has_voted FROM students WHERE id = ${guard.dbId}`) as {
    has_voted: boolean;
  }[];
  if (!studentRows[0] || studentRows[0].has_voted) {
    return NextResponse.json({ error: "You have already voted." }, { status: 403 });
  }

  // Validate the ballot covers every position exactly once, and that
  // every candidate really belongs to the position claimed, and the
  // vote type matches whether the position is contested or unopposed.
  const positions = (await sql`SELECT id FROM positions`) as { id: number }[];
  const positionIds = new Set(positions.map((p) => p.id));

  const candidates = (await sql`SELECT id, position_id FROM candidates`) as {
    id: number;
    position_id: number;
  }[];
  const candidateById = new Map(candidates.map((c) => [c.id, c]));
  const candidateCountByPosition = new Map<number, number>();
  for (const c of candidates) {
    candidateCountByPosition.set(c.position_id, (candidateCountByPosition.get(c.position_id) ?? 0) + 1);
  }

  if (votes.length !== positionIds.size) {
    return NextResponse.json({ error: "Please make a selection for every position before submitting." }, { status: 400 });
  }

  const seenPositions = new Set<number>();
  for (const vote of votes) {
    if (!positionIds.has(vote.position_id)) {
      return NextResponse.json({ error: "Invalid position in submission." }, { status: 400 });
    }
    if (seenPositions.has(vote.position_id)) {
      return NextResponse.json({ error: "Duplicate position in submission." }, { status: 400 });
    }
    seenPositions.add(vote.position_id);

    const candidate = candidateById.get(vote.candidate_id);
    if (!candidate || candidate.position_id !== vote.position_id) {
      return NextResponse.json({ error: "Invalid candidate selection." }, { status: 400 });
    }

    const isUnopposed = (candidateCountByPosition.get(vote.position_id) ?? 0) === 1;
    if (isUnopposed && vote.vote_type !== "yes" && vote.vote_type !== "no") {
      return NextResponse.json({ error: "Please choose YES or NO for unopposed positions." }, { status: 400 });
    }
    if (!isUnopposed && vote.vote_type !== "standard") {
      return NextResponse.json({ error: "Invalid vote type for a contested position." }, { status: 400 });
    }
  }

  try {
    const queries = votes.map((vote) =>
      sql`
        INSERT INTO votes (student_id, candidate_id, position_id, vote_type)
        VALUES (${guard.studentId}, ${vote.candidate_id}, ${vote.position_id}, ${vote.vote_type})
      `
    );
    queries.push(sql`UPDATE students SET has_voted = true WHERE id = ${guard.dbId}` as any);

    await sql.transaction(queries as any);
  } catch (err) {
    return NextResponse.json({ error: "Failed to record your vote. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
