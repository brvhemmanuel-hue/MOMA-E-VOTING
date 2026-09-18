"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { AlertBox } from "@/components/AlertBox";
import type { Position } from "@/lib/types";

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPositions() {
    setLoading(true);
    const res = await fetch("/api/admin/positions");
    if (res.ok) setPositions((await res.json()).positions);
    setLoading(false);
  }

  useEffect(() => {
    loadPositions();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_name: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to add position." });
        return;
      }
      setMessage({ type: "success", text: "Position added!" });
      setName("");
      setAddOpen(false);
      loadPositions();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this position? Its candidates and votes will also be removed.")) return;
    const res = await fetch(`/api/admin/positions/${id}`, { method: "DELETE" });
    if (res.ok) loadPositions();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-extrabold text-moma-blue">Election Positions</h2>
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          Add Position
        </button>
      </div>

      {message && <div className="mb-4"><AlertBox type={message.type} message={message.text} /></div>}

      <div className="card overflow-x-auto p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Position Name</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-slate-400">
                  No positions yet. Add one to get started.
                </td>
              </tr>
            ) : (
              positions.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2 font-semibold">{p.position_name}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Position">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Position Name</label>
            <input
              className="input"
              required
              placeholder="e.g. Senior Prefect"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Adding…" : "Add"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
