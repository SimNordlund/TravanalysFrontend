import { ThumbsUp } from "lucide-react";
import LikeButton from "./Components/LikeButton";

export default function Pricing() {
  return (
    <section
      aria-labelledby="like-travanalys-title"
      className="bg-slate-100 px-3 pb-12 pt-2 text-left sm:px-6 sm:pb-16 sm:pt-4"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 px-1 sm:mb-8">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            <span aria-hidden="true" className="h-1 w-6 rounded-full bg-indigo-500" />
            Ditt stöd gör skillnad
          </p>
          <h2 id="like-travanalys-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Gilla travanalys.se<span className="text-indigo-500">.</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
            Har du nytta av verktyget? Visa din uppskattning med en tumme upp.
          </p>
        </header>

        <div className="analytics-section">
          <div className="grid min-w-0 items-center gap-6 md:grid-cols-[minmax(0,1fr)_17rem] md:gap-8">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white text-indigo-600 shadow-sm" aria-hidden="true">
                <ThumbsUp className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="chart-kicker">Tack för ditt engagemang</p>
                <h3 className="chart-title">Vi utvecklar Travanalys tillsammans</h3>
                <p className="chart-description max-w-lg">
                  Varje gillande ger oss lite extra energi att fortsätta utveckla
                  analyserna och göra verktyget bättre för dig.
                </p>
              </div>
            </div>
            <LikeButton />
          </div>
        </div>
      </div>
    </section>
  );
}
