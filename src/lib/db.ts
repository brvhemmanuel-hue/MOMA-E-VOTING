import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon Postgres connection string to your environment variables."
    );
  }
  return url;
}

// Tagged-template SQL client (HTTP driver — ideal for Vercel serverless
// functions, no persistent connections to manage).
// `sql` is callable as a tagged template AND exposes `sql.transaction(...)`
// for running several queries atomically in one round trip — used by the
// vote-submission route so a student's ballot is saved all-or-nothing.
export const sql = neon(getDatabaseUrl());
