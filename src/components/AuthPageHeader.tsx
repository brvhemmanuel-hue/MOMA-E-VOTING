import { Logo } from "@/components/Logo";
import { SCHOOL_NAME } from "@/lib/config";

export function AuthPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto mb-6 max-w-md text-center">
      <Logo size={80} className="mx-auto mb-3 border-4 border-moma-gold shadow-lg" />
      <h2 className="font-heading text-lg font-extrabold uppercase text-moma-blue sm:text-xl">{SCHOOL_NAME}</h2>
      <p className="text-sm font-semibold italic text-slate-500">{subtitle}</p>
      <h1 className="sr-only">{title}</h1>
    </div>
  );
}
