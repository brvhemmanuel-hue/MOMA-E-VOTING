"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, IdCard, Sparkles } from "lucide-react";
import { AuthPageHeader } from "@/components/AuthPageHeader";
import { AlertBox } from "@/components/AlertBox";
import { Footer } from "@/components/Footer";

export default function GenerateCodePage() {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [fullname, setFullname] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setAccessCode("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setFullname(data.fullname);
      setAccessCode(data.accessCode);
      setInfo(
        data.alreadyGenerated
          ? `Your access code was already generated, ${data.fullname}.`
          : `Welcome ${data.fullname}! Your unique access code has been generated.`
      );
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
          <AuthPageHeader title="Get Voting Code" subtitle="Your Vote, Your Future, Your Voice" />

          <div className="card p-6 sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-moma-blue/10 text-moma-blue">
                <IdCard size={28} strokeWidth={2} />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-800">Get Voting Code</h3>
              <p className="text-sm text-slate-500">Enter your Index Number to receive your code</p>
            </div>

            {error && <div className="mb-4"><AlertBox type="error" message={error} /></div>}
            {info && <div className="mb-4"><AlertBox type={accessCode ? "success" : "info"} message={info} /></div>}

            {accessCode ? (
              <>
                <div className="mb-6 rounded-xl border-2 border-moma-blue bg-slate-50 p-6 text-center shadow-sm">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Your Voting Code
                  </p>
                  <h1 className="font-heading text-5xl font-extrabold tracking-widest text-moma-blue">
                    {accessCode}
                  </h1>
                  <hr className="my-4 border-slate-200" />
                  <p className="text-xs font-bold text-red-600">Write this down! You need it to vote.</p>
                </div>
                <Link href="/student/login" className="btn-primary w-full">
                  Proceed to Login
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Index Number (Student ID)</label>
                  <input
                    className="input"
                    required
                    autoFocus
                    placeholder="e.g. SHS001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Generating…" : "Generate My Code"}
                  {!loading && <Sparkles size={18} strokeWidth={2.5} />}
                </button>
                <div className="text-center">
                  <Link href="/student/login" className="text-sm font-bold text-moma-blue hover:underline">
                    Already have a code? Login here
                  </Link>
                </div>
              </form>
            )}
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
