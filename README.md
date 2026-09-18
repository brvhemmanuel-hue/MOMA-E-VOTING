# Mount Olivet Methodist Academy — Online Voting System (MOMA EVS)

A secure, modern student-elections platform for **Mount Olivet Methodist Academy**
(Dansoman, Accra) — rebuilt from the ground up on a stack designed for
**Vercel (frontend + serverless backend) and Neon (serverless Postgres)**.

This project replaces an earlier PHP/MySQL system built for a different
school. Everything below is a fresh implementation, not a re-skin: PHP
sessions, MySQL, and local file uploads don't work on Vercel's serverless
functions, so the whole backend was rewritten around JWT sessions, Postgres,
and Vercel Blob storage.

---

## 1. What changed from the original system

| Area | Before | Now |
|---|---|---|
| School branding | Ebenezer Senior High School, green/yellow | **Mount Olivet Methodist Academy**, **blue/gold**, MOMA crest everywhere |
| Framework | Raw PHP pages | **Next.js 14** (App Router, TypeScript, Tailwind CSS) |
| Hosting | InfinityFree shared hosting | **Vercel** (static frontend + serverless functions) |
| Database | MySQL (InfinityFree) | **Neon Postgres** (serverless HTTP driver) |
| Sessions | PHP `$_SESSION` (server memory) | Signed **JWT cookies** (works across stateless serverless invocations) |
| Candidate photo uploads | Saved to local disk | **Vercel Blob** storage (serverless functions have no persistent disk) |
| "Thank you" voice message | A pre-recorded `.wav` file naming the old school | **Live browser text-to-speech** that always says the *current* school name (see §6) |

---

## 2. Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Neon** — serverless Postgres, accessed via `@neondatabase/serverless`
- **Vercel** — hosting for the app and its API routes (serverless functions)
- **Vercel Blob** — candidate photo storage
- **jose** — JWT signing/verification for admin & student sessions
- **bcryptjs** — password hashing (pure JS, no native build step — safe for serverless)

---

## 3. Project structure

```
app/
  page.tsx                     Home / welcome page
  results/page.tsx             Public live results
  student/
    login/, generate-code/     Public student pages
    (protected)/vote/, result/ Requires student session (enforced by middleware)
  admin/
    login/                     Public admin page
    (protected)/dashboard/, students/, candidates/, positions/,
                results/, final-results/, settings/
  api/
    admin/...                  Admin REST endpoints
    student/...                Student REST endpoints
    setup/route.ts             One-time "create default admin" route
src/
  lib/                         db.ts, auth.ts, config.ts, results.ts, etc.
  components/                  Shared UI (nav bars, cards, modals…)
database/
  schema.sql                   Run this against your Neon database
public/
  images/logo.png              MOMA crest (cropped from your uploaded artwork)
  images/default-avatar.png    Placeholder candidate photo
  audio/success-chime.wav      Short success chime played after voting
middleware.ts                  Protects /admin/* and /student/* pages
```

---

## 4. One-time setup

### 4.1 Create the Neon database

1. Create a project at [neon.tech](https://neon.tech) (or use an existing one).
2. Copy the **pooled connection string** from your Neon dashboard.
3. Run the schema against it:
   ```bash
   psql "postgresql://...your-neon-connection-string.../moma_evs?sslmode=require" -f database/schema.sql
   ```
   (Or paste the contents of `database/schema.sql` into the Neon SQL Editor and run it.)

### 4.2 Deploy to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repo and import it into Vercel,
   **or** run `vercel` from the project root with the Vercel CLI.
2. In your Vercel project, go to **Storage → Create Database → Blob** and
   attach it to the project. This automatically sets `BLOB_READ_WRITE_TOKEN`
   for you — you don't need to copy it manually.
3. Under **Project Settings → Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon connection string |
   | `ADMIN_JWT_SECRET` | A long random string (`openssl rand -base64 48`) |
   | `STUDENT_JWT_SECRET` | A **different** long random string |
   | `SETUP_SECRET` | A random string, used once to bootstrap the admin account |

   (`BLOB_READ_WRITE_TOKEN` is set automatically by step 2.)

4. Deploy. Vercel will run `next build` automatically.

### 4.3 Create the default admin account

Visit (once):

```
https://your-domain.vercel.app/api/setup?key=YOUR_SETUP_SECRET
```

This creates the default admin:

- **Username:** `admin`
- **Password:** `admin123`

This route is safe to leave in place — calling it again is a no-op once an
admin exists. Still, **log in immediately and change the password** from
**Admin → Settings**.

### 4.4 Add positions, candidates, and students

From the Admin Portal:
1. **Positions** → add each role being contested (e.g. "Senior Prefect").
2. **Candidates** → add candidates per position, with photo + manifesto.
   A position with exactly **one** candidate automatically becomes a
   YES/NO referendum on the ballot and results pages — same behavior as
   the original system.
3. **Students** → add students individually or bulk-import a CSV with
   columns `student_id, fullname, class, password` (a header row is fine
   and will be skipped automatically).

Students then visit **/student/generate-code** with their Student ID to get
a one-time 6-character access code, then log in at **/student/login** with
that code to vote.

---

## 5. Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Open `http://localhost:3000`. Note that candidate photo uploads
(`/api/admin/candidates`) need a real `BLOB_READ_WRITE_TOKEN` to work — run
`vercel env pull .env.local` after enabling Blob storage on your Vercel
project to get one locally, or just test that feature after deploying.

---

## 6. About the "Thank You" voice message

The original system played a pre-recorded `.wav` file after a student voted.
That recording is opaque binary audio — it isn't something that can be
"find-and-replaced" the way text can be, and there is no reliable way to
verify or re-synthesize its exact spoken words in this environment.

Rather than risk shipping a voice clip that might still reference the old
school, the result page (`/student/result`) now:

1. Plays a short, freshly generated success chime
   (`public/audio/success-chime.wav`, a simple tone — not a voice recording,
   so there's nothing in it to mis-brand), then
2. Uses the browser's built-in **Web Speech API**
   (`window.speechSynthesis`) to *speak* the confirmation message live,
   built from `ELECTION_ANNOUNCEMENT_TEXT` in `src/lib/config.ts`:

   > "Thank you for participating in the Mount Olivet Methodist Academy
   > elections. Your vote has been securely recorded."

This is actually more maintainable: if the school name or wording ever
changes again, you only need to edit one line in `src/lib/config.ts` — no
audio re-recording required. If you'd prefer a specific recorded voice
instead, drop an MP3/WAV into `public/audio/` and swap the
`speechSynthesis` call in
`app/student/(protected)/result/page.tsx` for an `<audio>` playback of that
file.

---

## 7. Rebranding reference

All of the following were carried over/updated for Mount Olivet Methodist Academy:

- **School name, tagline, and motto** — centralized in `src/lib/config.ts`
  (`SCHOOL_NAME`, `SCHOOL_TAGLINE`, `SCHOOL_MOTTO`). Change them there and
  they update everywhere in the app.
- **Crest/logo** — `public/images/logo.png`, cropped and compressed from
  your uploaded artwork, used in the navbars, login headers, home page,
  and printed final report. Compressed favicon variants live at
  `app/icon.png` and `app/apple-icon.png` (auto-detected by Next.js — no
  manual `<link>` tags needed).
- **Color theme** — blue (`moma-blue` / `moma-navy`) and gold
  (`moma-gold`) replace the old green/yellow theme everywhere, defined
  centrally in `tailwind.config.ts`.
- **Icons** — all interface icons use the [lucide-react](https://lucide.dev)
  icon set (clean line icons), not emoji, for a consistent, professional
  look across every page.

## 8. Production-readiness checklist

The following were specifically checked/fixed for a polished, production
feel (not just a working prototype):

- **No horizontal scroll** — `overflow-x: hidden` set defensively on
  `html`/`body`; wide tables scroll independently inside their own
  container instead of pushing the page wide.
- **Mobile navigation** — the admin navbar collapses into a hamburger menu
  below the `lg` breakpoint instead of wrapping awkwardly.
- **Favicon** — `app/icon.png` + `app/apple-icon.png` (compressed, derived
  from the school crest).
- **Per-page titles & meta descriptions** — every route has its own
  `<title>` (e.g. "Student Login | Mount Olivet Methodist Academy") and
  description via `generateMetadata`/`metadata` exports, instead of one
  generic title everywhere.
- **Custom 404 page** — `app/not-found.tsx`, styled consistently with the
  rest of the app instead of a default Next.js error screen.
- **Dynamic copyright year & footer links** — `src/components/Footer.tsx`
  appears on every public page with working internal links (no dead/unused
  nav items).
- **Compressed images** — logo and placeholder-avatar PNGs are
  palette-quantized (logo: ~205KB → ~89KB) without visible quality loss;
  Next.js's built-in image optimizer additionally resizes/re-encodes them
  on the fly wherever they're displayed.
- **Consistent success/error messaging** — every form (login, add student,
  bulk upload, add candidate, add position, settings) shows an explicit
  success or error alert rather than failing silently.
- **No placeholder/lorem-ipsum text** — all copy is real, and no unused nav
  links point to non-existent pages.
- **Clickable logo everywhere** — the crest in every navbar links back to
  the relevant home/dashboard page.

## 9. Security notes

- Admin and student sessions are separate signed JWT cookies
  (`httpOnly`, `SameSite=Lax`, `Secure` in production) — one can't be used
  to impersonate the other.
- Passwords (admin and student) are hashed with bcrypt before storage.
- The vote-submission endpoint validates that every position is answered
  exactly once, that each candidate belongs to the claimed position, and
  that the vote type (YES/NO vs. standard) matches whether the position is
  contested — then writes all vote rows **and** flips `has_voted` in a
  single atomic database transaction, so a student can never end up
  partially voted or vote twice.
- A unique index on `votes(student_id, position_id)` gives a second,
  database-level guarantee against double voting.
