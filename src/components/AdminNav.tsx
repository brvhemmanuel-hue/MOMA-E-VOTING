"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  ListChecks,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { SCHOOL_SHORT_NAME } from "@/lib/config";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/candidates", label: "Candidates", icon: UserRound },
  { href: "/admin/positions", label: "Positions", icon: ListChecks },
  { href: "/admin/results", label: "Live Results", icon: BarChart3 },
  { href: "/admin/final-results", label: "Final Report", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 border-b-4 border-moma-gold bg-moma-blue shadow-lg no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Logo size={40} className="border-2 border-moma-gold" />
          <span className="font-heading text-base font-extrabold text-moma-gold sm:text-lg">
            {SCHOOL_SHORT_NAME} Admin
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
                  active ? "bg-moma-gold text-moma-navy" : "text-moma-gold hover:bg-white/10"
                }`}
              >
                <Icon size={16} strokeWidth={2.5} />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-1.5 rounded-lg bg-moma-gold px-3 py-2 text-sm font-bold text-moma-navy transition hover:bg-moma-gold-light"
          >
            <LogOut size={16} strokeWidth={2.5} />
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-2 text-moma-gold hover:bg-white/10 lg:hidden"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-moma-blue-dark px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                    active ? "bg-moma-gold text-moma-navy" : "text-moma-gold hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="mt-1 flex items-center gap-2.5 rounded-lg bg-moma-gold px-3 py-2.5 text-sm font-bold text-moma-navy transition hover:bg-moma-gold-light"
            >
              <LogOut size={18} strokeWidth={2.5} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
