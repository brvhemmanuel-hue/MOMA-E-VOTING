"use client";

import { useState } from "react";
import { AlertBox } from "@/components/AlertBox";
import { PasswordInput } from "@/components/PasswordInput";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to update password." });
        return;
      }
      setMessage({ type: "success", text: "Password updated!" });
      setPassword("");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("WARNING: This will delete ALL votes. Continue?")) return;
    setResetting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to reset system." });
        return;
      }
      setMessage({ type: "warning", text: data.message ?? "System reset: All votes cleared." });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 font-heading text-2xl font-extrabold text-moma-blue">Settings</h2>

      {message && <div className="mb-6"><AlertBox type={message.type} message={message.text} /></div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h4 className="mb-4 font-heading text-lg font-bold text-slate-800">Change Password</h4>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <PasswordInput
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>

        <div className="card border-2 border-red-200 p-6">
          <h4 className="mb-2 font-heading text-lg font-bold text-red-600">Danger Zone</h4>
          <p className="mb-4 text-sm text-slate-500">
            Resetting the system will delete all cast votes and allow students to vote again.
          </p>
          <button onClick={handleReset} disabled={resetting} className="btn-danger">
            {resetting ? "Resetting…" : "Reset Election Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
