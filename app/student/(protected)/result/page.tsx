"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LogOut } from "lucide-react";
import { SCHOOL_NAME } from "@/lib/config";

export default function StudentResultPage() {
  return (
    <Suspense fallback={null}>
      <StudentResultContent />
    </Suspense>
  );
}

function StudentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const [needsGesture, setNeedsGesture] = useState(false);

  useEffect(() => {
    if (!success) return;

    let cancelled = false;

    function speakThankYou() {
      if (cancelled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(
        `Thank you for participating in the ${SCHOOL_NAME} elections. Your vote has been securely recorded.`
      );
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    // Play a short success chime immediately, then speak the announcement.
    const audio = new Audio("/audio/success-chime.wav");
    audio
      .play()
      .then(() => {
        audio.onended = speakThankYou;
      })
      .catch(() => {
        // Autoplay was blocked — wait for any user interaction, then play both.
        setNeedsGesture(true);
        const handler = () => {
          audio.play().catch(() => {});
          speakThankYou();
          document.removeEventListener("click", handler);
        };
        document.addEventListener("click", handler, { once: true });
      });

    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
    };
  }, [success]);

  async function handleLogout() {
    await fetch("/api/student/logout", { method: "POST" });
    router.push("/student/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-10">
      <div className="card w-full max-w-lg rounded-3xl p-10 text-center">
        <CheckCircle2 size={84} strokeWidth={1.5} className="mx-auto mb-4 text-emerald-500" />
        <h1 className="font-heading text-4xl font-extrabold text-moma-blue">THANK YOU!</h1>
        <p className="mx-auto mt-4 max-w-sm text-slate-500">
          Your vote has been securely cast and recorded. Your participation helps shape the future of{" "}
          {SCHOOL_NAME}.
        </p>

        {needsGesture && (
          <p className="mt-3 text-xs font-semibold text-amber-600">Tap anywhere to hear the confirmation.</p>
        )}

        <button onClick={handleLogout} className="btn-primary mt-8 w-full py-4">
          <LogOut size={18} strokeWidth={2.5} />
          Logout Now
        </button>

        <p className="mt-4 text-xs text-slate-400">Please logout to ensure your session is closed securely.</p>
      </div>
    </div>
  );
}
