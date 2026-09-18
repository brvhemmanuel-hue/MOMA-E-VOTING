"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AuthPageHeader } from "@/components/AuthPageHeader";
import { AlertBox } from "@/components/AlertBox";
import { Footer } from "@/components/Footer";

export default function StudentLoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, access_code: accessCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push(data.hasVoted ? "/student/result" : "/student/vote");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-100">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <AuthPageHeader title="Student Portal" subtitle="Cast Your Vote Securely" />

          <div className="card overflow-hidden border-t-8 border-moma-blue">
            <div className="border-b-4 border-moma-blue bg-moma-gold px-6 py-6 text-center">
              <h2 className="font-heading text-xl font-extrabold text-moma-blue">STUDENT PORTAL</h2>
              <p className="text-sm font-bold text-moma-navy/80">Cast Your Vote Securely</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
              {error && <AlertBox type="error" message={error} />}

              <div>
                <label className="label">Index Number</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. SHS001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Access Code</label>
                <input
                  className="input text-center font-bold tracking-widest"
                  required
                  maxLength={8}
                  placeholder="6-DIGIT CODE"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Logging in…" : "LOGIN TO VOTE"}
                {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
              </button>

              <div className="text-center text-sm">
                <p className="mb-1 text-slate-500">Don&apos;t have an access code?</p>
                <Link href="/student/generate-code" className="inline-flex items-center gap-1 font-bold text-moma-blue hover:underline">
                  Get Your Code Here
                  <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-moma-blue">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer variant="light" />
    </main>
  );
}
