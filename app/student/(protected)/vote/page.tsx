"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, X, Pencil, Send, ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";
import { AlertBox } from "@/components/AlertBox";

interface Candidate {
  id: number;
  fullname: string;
  photo: string | null;
  position_id: number;
  manifesto: string | null;
}

interface Position {
  id: number;
  position_name: string;
  sort_order: number;
  candidates: Candidate[];
}

interface Selection {
  candidate_id: number;
  vote_type: "standard" | "yes" | "no";
}

export default function VotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [step, setStep] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [selections, setSelections] = useState<Record<number, Selection>>({});
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/student/ballot");
        const data = await res.json();
        if (!res.ok) {
          if (data.hasVoted) {
            router.replace("/student/result");
            return;
          }
          setError(data.error ?? "Failed to load ballot.");
          return;
        }
        setPositions(data.ballot);
      } catch {
        setError("Failed to load ballot. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading ballot…</div>;
  }

  if (error) {
    return (
      <div className="py-10">
        <AlertBox type="error" message={error} />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="py-10">
        <AlertBox type="info" message="No positions have been configured for this election yet. Please check back later." />
      </div>
    );
  }

  const totalSteps = positions.length;
  const current = positions[step];
  const isUnopposed = current.candidates.length === 1;

  function selectCandidate(positionId: number, candidateId: number, voteType: Selection["vote_type"]) {
    setStepError("");
    setSelections((prev) => ({ ...prev, [positionId]: { candidate_id: candidateId, vote_type: voteType } }));
  }

  function goNext() {
    if (!selections[current.id]) {
      setStepError("Please make a selection before proceeding.");
      return;
    }
    setStepError("");
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setReviewing(true);
    }
  }

  function goPrev() {
    setStepError("");
    if (reviewing) {
      setReviewing(false);
      setStep(totalSteps - 1);
      return;
    }
    if (step > 0) setStep(step - 1);
  }

  async function submitFinal() {
    setSubmitting(true);
    setStepError("");
    try {
      const votes = Object.entries(selections).map(([positionId, sel]) => ({
        position_id: Number(positionId),
        candidate_id: sel.candidate_id,
        vote_type: sel.vote_type,
      }));
      const res = await fetch("/api/student/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStepError(data.error ?? "Failed to submit your vote.");
        return;
      }
      router.push("/student/result?success=1");
      router.refresh();
    } catch {
      setStepError("Failed to submit your vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reviewing) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-extrabold text-moma-blue">REVIEW YOUR SELECTIONS</h1>
          <p className="text-slate-500">Please confirm your choices before final submission.</p>
        </div>

        {stepError && <div className="mb-4"><AlertBox type="error" message={stepError} /></div>}

        <div className="card divide-y divide-slate-100">
          {positions.map((p) => {
            const sel = selections[p.id];
            const candidate = p.candidates.find((c) => c.id === sel?.candidate_id);
            return (
              <div key={p.id} className="flex items-center gap-4 border-l-4 border-moma-blue bg-slate-50 p-4 m-2 rounded-lg">
                <Image
                  src={candidate?.photo || "/images/default-avatar.png"}
                  alt={candidate?.fullname ?? ""}
                  width={64}
                  height={64}
                  unoptimized={Boolean(candidate?.photo)}
                  className="h-16 w-16 rounded-full border-2 border-white object-cover shadow"
                />
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wide text-slate-400">{p.position_name}</h6>
                  <h4 className="font-heading text-lg font-bold text-slate-800">
                    {sel?.vote_type === "yes" && <span className="text-emerald-600">YES (Approve)</span>}
                    {sel?.vote_type === "no" && <span className="text-red-600">NO (Reject)</span>}
                    {sel?.vote_type === "standard" && candidate?.fullname}
                  </h4>
                </div>
                <Check size={26} strokeWidth={3} className="ml-auto text-emerald-600" />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button onClick={goPrev} className="btn-outline">
            <Pencil size={16} strokeWidth={2.5} />
            Change Votes
          </button>
          <button onClick={submitFinal} disabled={submitting} className="btn-primary">
            {submitting ? "Submitting…" : "Submit All Votes"}
            {!submitting && <Send size={16} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    );
  }

  const percent = ((step + 1) / totalSteps) * 100;
  const savedSelection = selections[current.id];

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-moma-blue transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-extrabold uppercase text-moma-blue">
          {current.position_name}
        </h1>
        <p className="font-bold text-slate-500">
          Step {step + 1} of {totalSteps}
        </p>
      </div>

      {stepError && <div className="mb-6"><AlertBox type="error" message={stepError} /></div>}

      <div className={`grid gap-6 ${isUnopposed ? "mx-auto max-w-md" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {current.candidates.map((c) => {
          const isSelected = savedSelection?.candidate_id === c.id;
          return (
            <div
              key={c.id}
              className={`card overflow-hidden border-4 transition-all ${
                isSelected ? "-translate-y-1 border-moma-blue shadow-xl" : "border-transparent"
              } ${!isUnopposed ? "cursor-pointer hover:-translate-y-1" : ""}`}
              onClick={() => {
                if (!isUnopposed) selectCandidate(current.id, c.id, "standard");
              }}
            >
              <div className="relative">
                <Image
                  src={c.photo || "/images/default-avatar.png"}
                  alt={c.fullname}
                  width={400}
                  height={350}
                  unoptimized={Boolean(c.photo)}
                  className="h-[280px] w-full border-b-8 border-moma-gold object-cover"
                />
                {isSelected && !isUnopposed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-moma-blue/60">
                    <Check size={72} strokeWidth={3} className="text-white" />
                  </div>
                )}
              </div>
              <div className="p-4 text-center">
                <h2 className="font-heading text-xl font-bold text-slate-800">{c.fullname}</h2>
                {c.manifesto && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.manifesto}</p>}

                {isUnopposed ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => selectCandidate(current.id, c.id, "yes")}
                      className={`rounded-xl border-2 py-3 font-bold transition ${
                        savedSelection?.vote_type === "yes"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <Check size={16} strokeWidth={3} className="inline" /> YES
                    </button>
                    <button
                      onClick={() => selectCandidate(current.id, c.id, "no")}
                      className={`rounded-xl border-2 py-3 font-bold transition ${
                        savedSelection?.vote_type === "no"
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-red-600 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <X size={16} strokeWidth={3} className="inline" /> NO
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mt-4 w-full rounded-xl py-3 font-bold ${
                      isSelected ? "bg-moma-blue text-moma-gold" : "border-2 border-moma-blue text-moma-blue"
                    }`}
                  >
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5"><Check size={16} strokeWidth={3} /> SELECTED</span>
                    ) : (
                      "CLICK TO SELECT"
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl border-t-4 border-moma-blue bg-white p-4 shadow-lg sm:p-6">
        <button onClick={goPrev} disabled={step === 0} className="btn-secondary">
          <ChevronLeft size={18} strokeWidth={2.5} />
          Previous
        </button>
        <button onClick={goNext} className="btn-primary">
          {step < totalSteps - 1 ? (
            <>
              Next Position
              <ChevronRight size={18} strokeWidth={2.5} />
            </>
          ) : (
            <>
              Review Choices
              <ClipboardCheck size={18} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
