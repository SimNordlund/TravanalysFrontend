import { useState, useEffect } from "react";
import { Check, Loader2, ThumbsUp } from "lucide-react";

function LikeButton() {
  const [likes, setLikes] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [error, setError] = useState("");
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API}/api/likes`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Kunde inte hämta gillanden");
        return response.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) setLikes(data.total);
      })
      .catch(() => {
        // Keep the button available even when the initial count cannot be loaded.
      });

    return () => controller.abort();
  }, [API]);

  const handleLike = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/likes`, { method: "POST" });
      if (!response.ok) throw new Error("Kunde inte spara gillandet");
      const data = await response.json();
      setLikes(data.total);
      setHasLiked(true);
    } catch {
      setError("Gillandet kunde inte sparas. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0 border-t border-slate-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
      <div className="mb-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-3">
        <span className="text-xs font-medium text-slate-500">Antal gillanden</span>
        <span aria-live="polite" aria-atomic="true" className="min-w-0 break-words text-right text-2xl font-bold tracking-tight tabular-nums text-slate-900">
          <span className="sr-only">Totalt </span>
          {likes == null ? "–" : Number(likes).toLocaleString("sv-SE")}
          <span className="sr-only"> {Number(likes) === 1 ? "gillande" : "gillanden"}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={handleLike}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:from-indigo-700 hover:to-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
      >
        {isSubmitting ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" />
        ) : (
          <ThumbsUp aria-hidden="true" className="h-4 w-4 shrink-0" />
        )}
        {isSubmitting ? "Sparar…" : "Gilla Travanalys"}
      </button>
      <p role="status" className={`mt-2 flex min-h-5 items-start justify-center gap-1.5 text-center text-[11px] leading-5 ${error ? "text-rose-600" : hasLiked ? "text-teal-700" : "text-slate-500"}`}>
        {hasLiked && !error && <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>{error || (hasLiked ? "Tack för ditt gillande!" : "En liten tumme upp betyder mycket.")}</span>
      </p>
    </div>
  );
}

export default LikeButton; 
