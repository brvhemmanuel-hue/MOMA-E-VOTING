import Image from "next/image";
import { Crown, AlertTriangle } from "lucide-react";
import type { PositionResult } from "@/lib/types";

function CandidatePhoto({
  src,
  alt,
  size,
}: {
  src: string | null;
  alt: string;
  size: number;
}) {
  return (
    <Image
      src={src || "/images/default-avatar.png"}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full border-4 border-white object-cover shadow-lg"
      style={{ width: size, height: size }}
      unoptimized={Boolean(src)}
    />
  );
}

export function ResultsGrid({ results }: { results: PositionResult[] }) {
  if (results.length === 0) {
    return (
      <div className="card p-10 text-center text-slate-500">
        No positions have been set up yet. Check back once the election is configured.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div key={result.position.id} className="card overflow-hidden">
          <div className="bg-moma-blue py-3 text-center">
            <h4 className="font-heading text-lg font-extrabold uppercase tracking-wide text-moma-gold">
              {result.position.position_name}
            </h4>
          </div>
          <div className="p-4 sm:p-6">
            {result.isUnopposed ? (
              <div className="mx-auto max-w-xs text-center">
                <div className="relative mx-auto mb-3 inline-block">
                  {result.isTie ? (
                    <span className="badge-red absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 shadow">
                      <AlertTriangle size={11} strokeWidth={2.5} />
                      TIE
                    </span>
                  ) : (result.yesPercent ?? 0) >= 50 && (result.totalVotes ?? 0) > 0 ? (
                    <span className="badge-gold absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 shadow">
                      <Crown size={11} strokeWidth={2.5} />
                      LEADING
                    </span>
                  ) : null}
                  <CandidatePhoto
                    src={result.candidates[0]?.photo ?? null}
                    alt={result.candidates[0]?.fullname ?? ""}
                    size={160}
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-14 w-14 items-center justify-center rounded-full border-2 border-moma-blue bg-moma-gold shadow">
                    <span className="text-sm font-extrabold text-moma-navy">{result.yesPercent}%</span>
                  </div>
                </div>
                <h3 className="font-heading text-xl font-bold text-slate-800">
                  {result.candidates[0]?.fullname}
                </h3>
                <div className="mx-auto mt-3 w-fit rounded-xl bg-moma-blue px-4 py-2 font-bold text-moma-gold shadow">
                  {result.totalVotes.toLocaleString()}
                  <span className="block text-[10px] font-semibold tracking-wider">TOTAL VOTES</span>
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <span className="badge-green">YES: {result.yesCount}</span>
                  <span className="badge-red">NO: {result.noCount}</span>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.candidates.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl border-2 p-4 text-center ${
                      c.is_leading ? "border-moma-gold bg-amber-50 shadow-md" : "border-slate-100"
                    }`}
                  >
                    <div className="relative mx-auto mb-3 inline-block">
                      {c.is_leading ? (
                        <span className="badge-gold absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 shadow">
                          <Crown size={11} strokeWidth={2.5} />
                          LEADING
                        </span>
                      ) : result.isTie && c.vote_count === Math.max(...result.candidates.map((x) => x.vote_count)) && c.vote_count > 0 ? (
                        <span className="badge-red absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 shadow">
                          <AlertTriangle size={11} strokeWidth={2.5} />
                          TIE
                        </span>
                      ) : null}
                      <CandidatePhoto src={c.photo} alt={c.fullname} size={130} />
                      <div className="absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center rounded-full border-2 border-moma-blue bg-moma-gold shadow">
                        <span className="text-xs font-extrabold text-moma-navy">{c.percent}%</span>
                      </div>
                    </div>
                    <h5 className="font-heading font-bold text-slate-800">{c.fullname}</h5>
                    <div className="mx-auto mt-2 w-fit rounded-lg bg-moma-blue px-3 py-1.5 text-sm font-bold text-moma-gold shadow">
                      {c.vote_count.toLocaleString()} <span className="text-[9px] font-semibold">VOTES</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
