import { Logo } from "@/components/Logo";
import { ResultsGrid } from "@/components/ResultsGrid";
import { getElectionResults } from "@/lib/results";
import { SCHOOL_NAME } from "@/lib/config";
import { RefreshButton } from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const results = await getElectionResults();

  return (
    <div>
      <div className="card mb-6 flex flex-col items-center justify-between gap-3 border-l-8 border-emerald-500 p-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <Logo size={56} className="border-2 border-moma-gold" />
          <div>
            <h2 className="font-heading text-xl font-extrabold text-moma-blue">ELECTION RESULTS</h2>
            <p className="text-sm text-slate-500">Live standings for {SCHOOL_NAME}</p>
          </div>
        </div>
        <RefreshButton />
      </div>

      <ResultsGrid results={results} />
    </div>
  );
}
