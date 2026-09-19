"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AuthPageHeader } from "@/components/AuthPageHeader";
import { AlertBox } from "@/components/AlertBox";
import { Footer } from "@/components/Footer";
import { PasswordInput } from "@/components/PasswordInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push("/admin/dashboard");
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
          <AuthPageHeader title="Admin Portal" subtitle="Secure Management Access" />

          <div className="card overflow-hidden border-t-8 border-moma-blue">
            <div className="border-b-4 border-moma-blue bg-moma-gold px-6 py-6 text-center">
              <h2 className="font-heading text-xl font-extrabold text-moma-blue">ADMIN PORTAL</h2>
              <p className="text-sm font-bold text-moma-navy/80">Secure Management Access</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
              {error && <AlertBox type="error" message={error} />}

              <div>
                <label className="label">Username</label>
                <input
                  className="input"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Password</label>
                <PasswordInput
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Logging in…" : "LOGIN TO DASHBOARD"}
                {!loading && <ArrowRight size={18} strokeWidth={2.5} />}
              </button>
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
