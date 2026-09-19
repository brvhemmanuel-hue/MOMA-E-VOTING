"use client";

import { useEffect, useState } from "react";
import { Plus, FileUp, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { AlertBox } from "@/components/AlertBox";
import { PasswordInput } from "@/components/PasswordInput";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ student_id: "", fullname: "", class: "", password: "" });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  async function loadStudents() {
    setLoading(true);
    const res = await fetch("/api/admin/students");
    if (res.ok) {
      const data = await res.json();
      setStudents(data.students);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to add student." });
        return;
      }
      setMessage({ type: "success", text: "Student added successfully!" });
      setForm({ student_id: "", fullname: "", class: "", password: "" });
      setAddOpen(false);
      loadStudents();
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!csvFile) return;
    setSaving(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("csv_file", csvFile);
      const res = await fetch("/api/admin/students/bulk", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to import CSV." });
        return;
      }
      setMessage({ type: "success", text: data.message });
      setCsvFile(null);
      setUploadOpen(false);
      loadStudents();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    if (res.ok) loadStudents();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="font-heading text-2xl font-extrabold text-moma-blue">Manage Students</h2>
        <div className="flex gap-2">
          <button onClick={() => setUploadOpen(true)} className="btn-outline">
            <FileUp size={16} strokeWidth={2.5} />
            Bulk Upload
          </button>
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            Add Student
          </button>
        </div>
      </div>

      {message && <div className="mb-4"><AlertBox type={message.type} message={message.text} /></div>}

      <div className="card overflow-x-auto p-4">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Student ID</th>
              <th className="px-3 py-2">Full Name</th>
              <th className="px-3 py-2">Class</th>
              <th className="px-3 py-2">Access Code</th>
              <th className="px-3 py-2">Voted</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                  No students added yet.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">{s.id}</td>
                  <td className="px-3 py-2 font-semibold">{s.student_id}</td>
                  <td className="px-3 py-2">{s.fullname}</td>
                  <td className="px-3 py-2">{s.class}</td>
                  <td className="px-3 py-2">
                    <code className="rounded bg-slate-100 px-2 py-0.5">{s.access_code ?? "Not Generated"}</code>
                  </td>
                  <td className="px-3 py-2">
                    {s.has_voted ? <span className="badge-green">Yes</span> : <span className="badge bg-slate-100 text-slate-500">No</span>}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(s.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
                      <Trash2 size={13} strokeWidth={2.5} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Student">
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="label">Student ID</label>
            <input
              className="input"
              required
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              required
              value={form.fullname}
              onChange={(e) => setForm({ ...form, fullname: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Class</label>
            <input
              className="input"
              required
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <PasswordInput
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save Student"}
          </button>
        </form>
      </Modal>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Bulk Student Upload">
        <form onSubmit={handleUpload} className="space-y-4">
          <p className="text-sm text-slate-500">
            Upload a CSV file with columns: <strong>student_id, fullname, class, password</strong>
          </p>
          <div>
            <label className="label">Choose CSV File</label>
            <input
              type="file"
              accept=".csv"
              required
              className="input"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Uploading…" : "Upload & Import"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
