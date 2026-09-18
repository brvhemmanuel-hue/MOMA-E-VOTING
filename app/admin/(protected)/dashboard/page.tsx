"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserRound,
  ListChecks,
  TrendingUp,
  FileText,
  Settings,
  UserCog,
  ClipboardList,
  Vote,
  Wrench,
  Info,
} from "lucide-react";
import { Logo } from "@/components/Logo";

interface Stats {
  totalStudents: number;
  totalCandidates: number;
  totalPositions: number;
  totalVoted: number;
}

const quickLinks = [
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/candidates", label: "Candidates", icon: UserRound },
  { href: "/admin/positions", label: "Positions", icon: ListChecks },
  { href: "/admin/results", label: "Live Standings", icon: TrendingUp, accent: true },
  { href: "/admin/final-results", label: "Final Report", icon: FileText, accent: true },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    (async () => {
      const [statsRes, meRes] = await Promise.all([fetch("/api/admin/stats"), fetch("/api/admin/me")]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (meRes.ok) {
        const me = await meRes.json();
        setUsername(me.username);
      }
    })();
  }, []);

  const cards = [
    { label: "Total Students", value: stats?.totalStudents, icon: Users },
    { label: "Candidates", value: stats?.totalCandidates, icon: UserCog },
    { label: "Positions", value: stats?.totalPositions, icon: ClipboardList },
    { label: "Votes Cast", value: stats?.totalVoted, icon: Vote, gold: true },
  ];

  return (
    <div>
      <div className="card mb-8 border-l-8 border-moma-gold p-6">
        <h2 className="font-heading text-2xl font-extrabold text-moma-blue">ADMIN CONTROL PANEL</h2>
        <p className="text-slate-500">Welcome back{username ? `, ${username}` : ""}. Manage your election from here.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card relative overflow-hidden p-5">
              <h5 className="text-xs font-bold uppercase tracking-wide text-slate-400">{c.label}</h5>
              <p className={`mt-1 font-heading text-3xl font-extrabold ${c.gold ? "text-moma-gold-dark" : "text-moma-blue"}`}>
                {c.value ?? "—"}
              </p>
              <Icon size={40} strokeWidth={1.5} className="absolute bottom-2 right-3 opacity-10" />
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h4 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-moma-blue">
            <Wrench size={18} strokeWidth={2.5} />
            Quick Management
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickLinks.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex h-28 flex-col items-center justify-center rounded-xl border-2 text-center font-bold transition hover:-translate-y-1 hover:shadow-md ${
                    l.accent ? "border-moma-gold bg-amber-50 text-moma-navy" : "border-moma-blue text-moma-blue hover:bg-moma-gold/10"
                  }`}
                >
                  <Icon size={26} strokeWidth={2} className="mb-2" />
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h4 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-moma-blue">
            <Info size={18} strokeWidth={2.5} />
            System Info
          </h4>
          <div className="mb-4 flex justify-center">
            <Logo size={100} className="border-4 border-moma-gold" />
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            <li className="flex justify-between py-2">
              <span className="text-slate-500">School Name</span>
              <span className="font-bold text-moma-blue">Mount Olivet Methodist Academy</span>
            </li>
            <li className="flex justify-between py-2">
              <span className="text-slate-500">Election Status</span>
              <span className="badge-green">Active</span>
            </li>
            <li className="flex justify-between py-2">
              <span className="text-slate-500">Admin User</span>
              <span className="text-slate-600">{username || "—"}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
