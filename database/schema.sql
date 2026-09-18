-- =========================================================
-- Mount Olivet Methodist Academy — Online Voting System
-- Postgres schema (for Neon)
--
-- Run this once against your Neon database, e.g.:
--   psql "$DATABASE_URL" -f database/schema.sql
-- or paste it into the Neon SQL Editor.
-- =========================================================

CREATE TABLE IF NOT EXISTS admins (
  id         SERIAL PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS positions (
  id            SERIAL PRIMARY KEY,
  position_name TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id           SERIAL PRIMARY KEY,
  student_id   TEXT NOT NULL UNIQUE,
  fullname     TEXT NOT NULL,
  class        TEXT NOT NULL,
  password     TEXT NOT NULL,
  access_code  TEXT,
  has_voted    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id           SERIAL PRIMARY KEY,
  fullname     TEXT NOT NULL,
  photo        TEXT,
  position_id  INTEGER NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  manifesto    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id           SERIAL PRIMARY KEY,
  student_id   TEXT NOT NULL,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  position_id  INTEGER NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  vote_type    TEXT NOT NULL DEFAULT 'standard' CHECK (vote_type IN ('standard', 'yes', 'no')),
  vote_time    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position_id);
CREATE INDEX IF NOT EXISTS idx_votes_position       ON votes(position_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate      ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_student         ON votes(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_access_code
  ON students(access_code) WHERE access_code IS NOT NULL;

-- A student may cast at most ONE vote per position (defence in depth —
-- the app also enforces this via the has_voted flag + a transaction).
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_student_position
  ON votes(student_id, position_id);
