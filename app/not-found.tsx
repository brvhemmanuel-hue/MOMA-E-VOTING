import Link from "next/link";
import type { Metadata } from "next";
import { Home, SearchX } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { SCHOOL_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: `The page you're looking for doesn't exist on the ${SCHOOL_NAME} voting platform.`,
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-moma-gradient">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border-2 border-moma-gold bg-black/30 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
          <Logo size={80} className="mx-auto mb-6 border-4 border-moma-gold" />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-moma-gold">
            <SearchX size={32} strokeWidth={1.75} />
          </div>
          <h1 className="font-heading text-5xl font-extrabold text-moma-gold">404</h1>
          <h2 className="mt-2 text-lg font-bold text-white">Page Not Found</h2>
          <p className="mx-auto mt-3 max-w-xs text-sm text-white/70">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>

          <Link href="/" className="btn-gold mt-8 w-full py-3.5">
            <Home size={18} strokeWidth={2.5} />
            Back to Home
          </Link>
        </div>
      </div>
      <Footer variant="dark" />
    </main>
  );
}
