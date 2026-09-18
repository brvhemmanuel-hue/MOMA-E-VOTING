import Link from "next/link";
import { GraduationCap, KeyRound, ShieldCheck, BarChart3 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/config";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-moma-gradient">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-3xl border-2 border-moma-gold bg-black/30 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
          <div className="mx-auto mb-6 w-fit rounded-full border-4 border-moma-gold bg-white p-2 shadow-gold">
            <Logo size={130} />
          </div>
          <h1 className="font-heading text-2xl font-extrabold leading-tight text-moma-gold sm:text-4xl">
            {SCHOOL_NAME}
          </h1>
          <h2 className="mt-2 text-lg font-light text-white sm:text-2xl">Online Voting System</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/80 sm:text-base">{SCHOOL_TAGLINE}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Link href="/student/login" className="btn-gold w-full py-4">
                <GraduationCap size={20} strokeWidth={2.5} />
                Student Login
              </Link>
              <Link
                href="/student/generate-code"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline"
              >
                <KeyRound size={15} />
                Get Access Code
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/admin/login"
                className="btn w-full border-2 border-moma-gold py-4 text-white hover:bg-moma-gold hover:text-moma-navy"
              >
                <ShieldCheck size={20} strokeWidth={2.5} />
                Admin Portal
              </Link>
              <Link
                href="/results"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline"
              >
                <BarChart3 size={15} />
                Live Results
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer variant="dark" />
    </main>
  );
}
