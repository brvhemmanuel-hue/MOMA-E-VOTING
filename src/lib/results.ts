import { sql } from "./db";
import type { CandidateResult, PositionResult } from "./types";

/**
 * Computes live standings for every position, mirroring the original
 * PHP system's logic:
 *  - A position with exactly one candidate is treated as a YES/NO
 *    referendum ("unopposed").
 *  - A position with 2+ candidates is a normal plurality contest.
 *  - Ties (equal top vote counts) are flagged instead of declaring
 *    a winner.
 */
export async function getElectionResults(): Promise<PositionResult[]> {
  const positions = (await sql`
    SELECT id, position_name, sort_order FROM positions ORDER BY sort_order ASC, id ASC
  `) as { id: number; position_name: string; sort_order: number }[];

  const results: PositionResult[] = [];

  for (const position of positions) {
    const candidates = (await sql`
      SELECT id, fullname, photo, manifesto
      FROM candidates
      WHERE position_id = ${position.id}
    `) as { id: number; fullname: string; photo: string | null; manifesto: string | null }[];

    const isUnopposed = candidates.length === 1;

    if (isUnopposed) {
      const candidate = candidates[0];
      const [{ yes_count }] = (await sql`
        SELECT COUNT(*)::int AS yes_count FROM votes
        WHERE position_id = ${position.id} AND vote_type = 'yes'
      `) as { yes_count: number }[];
      const [{ no_count }] = (await sql`
        SELECT COUNT(*)::int AS no_count FROM votes
        WHERE position_id = ${position.id} AND vote_type = 'no'
      `) as { no_count: number }[];

      const total = yes_count + no_count;
      const yesPercent = total > 0 ? Math.round((yes_count / total) * 1000) / 10 : 0;
      const noPercent = total > 0 ? Math.round((no_count / total) * 1000) / 10 : 0;
      const isTie = total > 0 && yes_count === no_count;
      const isElected = total > 0 && yes_count > no_count;

      results.push({
        position: position as any,
        isUnopposed: true,
        isTie,
        totalVotes: total,
        yesCount: yes_count,
        noCount: no_count,
        yesPercent,
        noPercent,
        isElected,
        candidates: [
          {
            id: candidate.id,
            fullname: candidate.fullname,
            photo: candidate.photo,
            vote_count: yes_count,
            percent: yesPercent,
            is_leading: isElected,
          },
        ],
      });
      continue;
    }

    const raw = (await sql`
      SELECT c.id, c.fullname, c.photo, COUNT(v.id)::int AS vote_count
      FROM candidates c
      LEFT JOIN votes v ON v.candidate_id = c.id
      WHERE c.position_id = ${position.id}
      GROUP BY c.id
      ORDER BY vote_count DESC, c.id ASC
    `) as { id: number; fullname: string; photo: string | null; vote_count: number }[];

    const total = raw.reduce((sum, c) => sum + c.vote_count, 0);
    const maxVotes = raw.length > 0 ? raw[0].vote_count : 0;
    const winnersAtMax = raw.filter((c) => maxVotes > 0 && c.vote_count === maxVotes).length;
    const isTie = winnersAtMax > 1;

    const candidateResults: CandidateResult[] = raw.map((c) => ({
      id: c.id,
      fullname: c.fullname,
      photo: c.photo,
      vote_count: c.vote_count,
      percent: total > 0 ? Math.round((c.vote_count / total) * 1000) / 10 : 0,
      is_leading: !isTie && maxVotes > 0 && c.vote_count === maxVotes,
    }));

    results.push({
      position: position as any,
      isUnopposed: false,
      isTie,
      totalVotes: total,
      candidates: candidateResults,
    });
  }

  return results;
}
