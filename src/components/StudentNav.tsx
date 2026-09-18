"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SCHOOL_SHORT_NAME } from "@/lib/config";

export function StudentNav({ fullname }: { fullname?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/student/logout", { method: "POST" });
    router.push("/student/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 border-b-4 border-moma-gold bg-moma-blue shadow-lg no-print">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/student/vote" className="flex items-center gap-3">
          <Logo size={40} className="border-2 border-moma-gold" />
          <span className="font-heading text-base font-extrabold text-moma-gold sm:text-lg">
            {SCHOOL_SHORT_NAME} Elections
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {fullname && <span className="hidden text-sm font-semibold text-white/90 sm:inline">{fullname}</span>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg bg-moma-gold px-3 py-2 text-sm font-bold text-moma-navy transition hover:bg-moma-gold-light"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
