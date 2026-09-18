import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";
import { sql } from "@/lib/db";
import { getElectionResults } from "@/lib/results";
import { Logo } from "@/components/Logo";
import { PrintButton } from "@/components/PrintButton";
import { SCHOOL_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function FinalResultsPage() {
  const results = await getElectionResults();

  const [{ total_voters }] = (await sql`SELECT COUNT(*)::int AS total_voters FROM students`) as {
    total_voters: number;
  }[];
  const [{ voted_count }] = (await sql`
    SELECT COUNT(*)::int AS voted_count FROM students WHERE has_voted = true
  `) as { voted_count: number }[];
  const turnout = total_voters > 0 ? Math.round((voted_count / total_voters) * 1000) / 10 : 0;

  const year = new Date().getFullYear();

  return (
    <div>
      <div className="no-print mb-4 text-right">
        <PrintButton />
      </div>

      <div className="report-header card mb-8 border-b-8 border-moma-blue p-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-4">
          <Logo size={90} className="border-2 border-moma-gold" />
          <div className="text-left">
            <h1 className="font-heading text-2xl font-extrabold uppercase text-moma-blue">{SCHOOL_NAME}</h1>
            <h4 className="font-bold text-slate-500">OFFICIAL ELECTION RESULTS REPORT</h4>
          </div>
        </div>
        <p className="italic text-slate-400">
          Academic Year: {year}/{year + 1}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3">
            <h6 className="text-xs font-bold text-slate-400">REGISTERED</h6>
            <p className="font-heading text-xl font-extrabold text-slate-800">{total_voters}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3">
            <h6 className="text-xs font-bold text-slate-400">VOTES CAST</h6>
            <p className="font-heading text-xl font-extrabold text-emerald-600">{voted_count}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3">
            <h6 className="text-xs font-bold text-slate-400">TURNOUT</h6>
            <p className="font-heading text-xl font-extrabold text-moma-gold-dark">{turnout}%</p>
          </div>
        </div>
      </div>

      {results.map((result) => {
        const winnerCandidate =
          !result.isTie && !result.isUnopposed && result.totalVotes > 0
            ? result.candidates.find((c) => c.is_leading)
            : undefined;

        return (
          <div key={result.position.id} className="card page-break mb-8 overflow-hidden">
            <div className="flex items-center justify-between bg-moma-blue px-5 py-3">
              <h4 className="font-heading font-extrabold uppercase text-moma-gold">
                {result.position.position_name}
              </h4>
              <div className="hidden print:block">
                <Logo size={32} />
              </div>
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2">Candidate / Choice</th>
                      <th className="p-2 text-center">Votes</th>
                      <th className="p-2 text-center">Percent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.isUnopposed ? (
                      <>
                        <tr className={result.isElected ? "bg-emerald-50 font-bold" : ""}>
                          <td className="flex items-center gap-1.5 p-2"><CheckCircle2 size={15} className="text-emerald-600" /> YES (Approve)</td>
                          <td className="p-2 text-center text-lg">{result.yesCount}</td>
                          <td className="p-2 text-center">{result.yesPercent}%</td>
                        </tr>
                        <tr className={!result.isElected && result.totalVotes > 0 && !result.isTie ? "bg-red-50 font-bold" : ""}>
                          <td className="flex items-center gap-1.5 p-2"><XCircle size={15} className="text-red-600" /> NO (Reject)</td>
                          <td className="p-2 text-center text-lg">{result.noCount}</td>
                          <td className="p-2 text-center">{result.noPercent}%</td>
                        </tr>
                      </>
                    ) : (
                      result.candidates.map((c) => (
                        <tr key={c.id} className={c.is_leading && c.vote_count > 0 ? "bg-amber-50 font-bold" : ""}>
                          <td className="flex items-center gap-3 p-2">
                            <Image
                              src={c.photo || "/images/default-avatar.png"}
                              alt={c.fullname}
                              width={36}
                              height={36}
                              unoptimized={Boolean(c.photo)}
                              className="h-9 w-9 rounded-full border object-cover"
                            />
                            {c.fullname}
                          </td>
                          <td className="p-2 text-center text-lg">{c.vote_count.toLocaleString()}</td>
                          <td className="p-2 text-center">{c.percent}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-center lg:col-span-5">
                {result.isUnopposed ? (
                  <div
                    className={`rounded-2xl border-4 bg-white p-5 shadow-sm ${
                      result.isTie || !result.isElected ? "border-red-400" : "border-emerald-500"
                    }`}
                  >
                    <h5 className={`mb-3 font-heading font-extrabold ${result.isTie || !result.isElected ? "text-red-600" : "text-emerald-600"}`}>
                      {result.isTie ? "TIE — NO WINNER" : result.isElected ? "ELECTED" : "NOT ELECTED"}
                    </h5>
                    <Image
                      src={result.candidates[0]?.photo || "/images/default-avatar.png"}
                      alt={result.candidates[0]?.fullname ?? ""}
                      width={130}
                      height={130}
                      unoptimized={Boolean(result.candidates[0]?.photo)}
                      className={`mx-auto mb-3 h-32 w-32 rounded-full border-4 object-cover shadow ${
                        result.isElected ? "border-moma-gold" : "border-slate-300"
                      }`}
                    />
                    <h4 className="font-heading text-lg font-bold text-slate-800">{result.candidates[0]?.fullname}</h4>
                    <div className="mt-3 flex justify-center gap-2">
                      <span className="badge-green">YES: {result.yesCount}</span>
                      <span className="badge-red">NO: {result.noCount}</span>
                    </div>
                  </div>
                ) : result.isTie ? (
                  <div className="rounded-2xl border-4 border-red-400 bg-white p-5 shadow-sm">
                    <h5 className="mb-3 font-heading font-extrabold text-red-600">TIE — NO WINNER</h5>
                    <div className="mb-3 flex justify-center gap-3">
                      {result.candidates
                        .filter((c) => c.is_leading || c.vote_count === Math.max(...result.candidates.map((x) => x.vote_count)))
                        .map((c) => (
                          <Image
                            key={c.id}
                            src={c.photo || "/images/default-avatar.png"}
                            alt={c.fullname}
                            width={70}
                            height={70}
                            unoptimized={Boolean(c.photo)}
                            className="h-[70px] w-[70px] rounded-full border-2 border-red-400 object-cover shadow-sm"
                          />
                        ))}
                    </div>
                    <p className="text-sm text-slate-500">
                      The top candidates have equal votes:{" "}
                      <span className="badge-red">{Math.max(...result.candidates.map((c) => c.vote_count))}</span>
                    </p>
                  </div>
                ) : winnerCandidate ? (
                  <div className="rounded-2xl border-4 border-emerald-500 bg-white p-5 shadow-sm">
                    <h5 className="mb-3 font-heading font-extrabold text-emerald-600">ELECTED</h5>
                    <Image
                      src={winnerCandidate.photo || "/images/default-avatar.png"}
                      alt={winnerCandidate.fullname}
                      width={130}
                      height={130}
                      unoptimized={Boolean(winnerCandidate.photo)}
                      className="mx-auto mb-3 h-32 w-32 rounded-full border-4 border-moma-gold object-cover shadow"
                    />
                    <h4 className="font-heading text-lg font-bold text-slate-800">{winnerCandidate.fullname}</h4>
                    <p className="text-sm text-slate-500">
                      Final Vote Count: <span className="badge-green">{winnerCandidate.vote_count}</span>
                    </p>
                  </div>
                ) : (
                  <div className="alert-info">No votes recorded for this position.</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
