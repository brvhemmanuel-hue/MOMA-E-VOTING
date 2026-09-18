import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Footer } from "@/components/Footer";
import { getElectionResults } from "@/lib/results";
import { SCHOOL_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Election Results",
  description: `Live, continuously updated election results for ${SCHOOL_NAME} student elections.`,
};

export default async function PublicResultsPage() {
  const results = await getElectionResults();

  return (
    <main className="flex min-h-screen flex-col bg-slate-100">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8">
        <div className="card mb-6 flex flex-col items-center gap-2 border-b-4 border-moma-gold p-6 text-center">
          <Logo size={64} className="border-2 border-moma-gold" />
          <h1 className="font-heading text-2xl font-extrabold text-moma-blue">LIVE ELECTION RESULTS</h1>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{SCHOOL_NAME}</p>
          <Link href="/" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-moma-blue hover:underline">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </div>

        <ResultsGrid results={results} />
      </div>
      <Footer variant="light" />
    </main>
  );
}
