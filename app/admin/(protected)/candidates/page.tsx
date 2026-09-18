"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { AlertBox } from "@/components/AlertBox";

interface CandidateRow {
  id: number;
  fullname: string;
  photo: string | null;
  position_id: number;
  manifesto: string | null;
  position_name: string;
}

interface PositionOption {
  id: number;
  position_name: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [positions, setPositions] = useState<PositionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullname, setFullname] = useState("");
  const [positionId, setPositionId] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  async function loadData() {
    setLoading(true);
    const [candRes, posRes] = await Promise.all([fetch("/api/admin/candidates"), fetch("/api/admin/positions")]);
    if (candRes.ok) setCandidates((await candRes.json()).candidates);
    if (posRes.ok) {
      const data = await posRes.json();
      setPositions(data.positions);
      if (data.positions[0]) setPositionId(String(data.positions[0].id));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("fullname", fullname);
      fd.append("position_id", positionId);
      fd.append("manifesto", manifesto);
      if (photo) fd.append("photo", photo);

      const res = await fetch("/api/admin/candidates", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to add candidate." });
        return;
      }
      setMessage({ type: "success", text: "Candidate added!" });
      setFullname("");
      setManifesto("");
      setPhoto(null);
      setAddOpen(false);
      loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this candidate?")) return;
    const res = await fetch(`/api/admin/candidates/${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-extrabold text-moma-blue">Manage Candidates</h2>
        <button
          onClick={() => setAddOpen(true)}
          disabled={positions.length === 0}
          className="btn-primary disabled:opacity-50"
          title={positions.length === 0 ? "Add a position first" : ""}
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Candidate
        </button>
      </div>

      {positions.length === 0 && (
        <div className="mb-4">
          <AlertBox type="info" message="Please add at least one position before adding candidates." />
        </div>
      )}

      {message && <div className="mb-4"><AlertBox type={message.type} message={message.text} /></div>}

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading…</div>
      ) : candidates.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">No candidates added yet.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              <Image
                src={c.photo || "/images/default-avatar.png"}
                alt={c.fullname}
                width={400}
                height={260}
                unoptimized={Boolean(c.photo)}
                className="h-56 w-full object-cover"
              />
              <div className="p-4">
                <h5 className="font-heading text-lg font-bold text-slate-800">{c.fullname}</h5>
                <p className="text-sm font-bold text-moma-blue">{c.position_name}</p>
                {c.manifesto && (
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.manifesto}</p>
                )}
                <hr className="my-3 border-slate-100" />
                <button onClick={() => handleDelete(c.id)} className="btn-danger w-full py-2 text-sm">
                  <Trash2 size={14} strokeWidth={2.5} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Candidate">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" required value={fullname} onChange={(e) => setFullname(e.target.value)} />
          </div>
          <div>
            <label className="label">Position</label>
            <select className="input" required value={positionId} onChange={(e) => setPositionId(e.target.value)}>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.position_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Photo</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label className="label">Manifesto</label>
            <textarea
              className="input"
              rows={3}
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
