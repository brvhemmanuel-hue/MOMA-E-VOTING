"use client";

import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  return (
    <button onClick={() => window.location.reload()} className="btn-gold px-4 py-2 text-sm">
      <RefreshCw size={15} strokeWidth={2.5} />
      Refresh
    </button>
  );
}
