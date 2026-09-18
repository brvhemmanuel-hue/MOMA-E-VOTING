"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-primary px-6 py-3 text-base shadow-lg">
      <Printer size={18} strokeWidth={2.5} />
      Print Official Report (PDF)
    </button>
  );
}
