import Link from "next/link";
import { SCHOOL_NAME, SCHOOL_SHORT_NAME } from "@/lib/config";

export function Footer({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const year = new Date().getFullYear();
  const linkClass =
    variant === "dark"
      ? "text-white/70 hover:text-white"
      : "text-slate-500 hover:text-moma-blue";

  return (
    <footer className={`no-print px-4 py-6 text-center text-xs ${variant === "dark" ? "text-white/60" : "text-slate-400"}`}>
      <nav className="mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
        <Link href="/" className={linkClass}>
          Home
        </Link>
        <Link href="/results" className={linkClass}>
          Live Results
        </Link>
        <Link href="/student/login" className={linkClass}>
          Student Portal
        </Link>
        <Link href="/admin/login" className={linkClass}>
          Admin Portal
        </Link>
      </nav>
      <p>
        &copy; {year} {SCHOOL_NAME} ({SCHOOL_SHORT_NAME}). All rights reserved.
      </p>
    </footer>
  );
}
