import { useState, useEffect } from "react";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";

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
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:max-w-xs sm:shrink-0">
      <div className="flex w-full items-stretch overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm sm:w-auto">
        <button
          type="button"
          onClick={handleLike}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="group inline-flex min-h-14 flex-1 items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-xs font-semibold text-white transition-colors hover:from-indigo-700 hover:to-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white disabled:cursor-wait disabled:opacity-70 sm:flex-none sm:px-5 sm:text-sm"
        >
          <HandThumbUpIcon aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:-rotate-12 motion-reduce:transform-none motion-reduce:transition-none" />
          {isSubmitting ? "Sparar…" : "Gilla Travanalys"}
        </button>
        <div aria-live="polite" aria-atomic="true" className="flex min-w-[4rem] flex-col items-center justify-center gap-0.5 px-3 py-2 sm:min-w-[4.5rem] sm:px-4">
          <span className="text-lg font-bold leading-none tabular-nums text-indigo-700">
            {likes == null ? "–" : Number(likes).toLocaleString("sv-SE")}
          </span>
          <span className="text-[10px] font-medium text-slate-500">
            {Number(likes) === 1 ? "gillande" : "gillanden"}
          </span>
        </div>
      </div>
      <p role="status" className={`min-h-5 text-center text-xs leading-5 ${error ? "text-rose-600" : "text-slate-500"}`}>
        {error || (hasLiked ? "Tack för ditt gillande!" : "En liten tumme upp betyder mycket.")}
      </p>
    </div>
  );
}

export default LikeButton; 
