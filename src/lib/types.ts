export interface Position {
  id: number;
  position_name: string;
  sort_order: number;
}

export interface Candidate {
  id: number;
  fullname: string;
  photo: string | null;
  position_id: number;
  manifesto: string | null;
}

export interface Student {
  id: number;
  student_id: string;
  fullname: string;
  class: string;
  access_code: string | null;
  has_voted: boolean;
}

export type VoteType = "standard" | "yes" | "no";

export interface CandidateResult {
  id: number;
  fullname: string;
  photo: string | null;
  vote_count: number;
  percent: number;
  is_leading: boolean;
}

export interface PositionResult {
  position: Position;
  isUnopposed: boolean;
  isTie: boolean;
  totalVotes: number;
  candidates: CandidateResult[];
  // Only populated when isUnopposed is true
  yesCount?: number;
  noCount?: number;
  yesPercent?: number;
  noPercent?: number;
  isElected?: boolean;
}
