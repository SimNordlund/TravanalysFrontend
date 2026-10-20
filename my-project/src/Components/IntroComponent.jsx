import { ArrowRight, BarChart3, MessageCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import vinst1 from "../Bilder/Vinst2.jpg";

const features = [
  {
    name: "Grafiskt beslutsunderlag",
    description:
      "Konsumera det grafiska beslutsunderlaget från den övergripande summeringen till olika djupdykningar i detaljer. Summeringen och analysperspektiven bryts ner i olika delanalyser som ofta skvallrar om en kommande bra prestation.",
    icon: BarChart3,
    iconClassName: "border-indigo-100 bg-indigo-50 text-indigo-600",
  },
  {
    name: "För spelare, kusk, tränare och ägare",
    description:
      "Analysverktyget kan användas av travsportens alla intressenter och roller. Fungerar som spelarens stöd för att lägga till eller ta bort en häst – eller bekräfta sin spelidé. Tränarnas och ägarnas stöd i anmälningsprocessen då analyser för propositioner även kommer presenteras.",
    icon: Users,
    iconClassName: "border-sky-100 bg-sky-50 text-sky-700",
  },
  {
    name: "Ta hjälp av Trav-olta",
    description:
      "Vi har även en travkunnig och finurlig AI-kompis kallad Trav-olta som gärna hjälper till med analysen.",
    icon: MessageCircle,
    iconClassName: "border-teal-100 bg-teal-50 text-teal-700",
  },
];

export default function IntroComponent() {
  return (
    <section
      aria-labelledby="intro-title"
      className="analytics-workspace px-3 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-12"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0 px-1">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                <span className="h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
                Travanalys
              </p>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
                Beta-version
              </span>
            </div>
            <h1 id="intro-title" className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Travsportens beslutsunderlag<span className="text-indigo-500">.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500 sm:text-base sm:leading-7">
              Jämför hästarnas profiler, utforska rankingen och följ resultaten.
              Från en samlad överblick till detaljerna som hjälper dig inför loppet.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/chart/analys"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:from-indigo-700 hover:to-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Utforska analysen
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#videoguide"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Se videoguiden
              </a>
            </div>
          </div>

          <figure className="analytics-section overflow-hidden !p-2 sm:!p-3">
            <img
              alt="Travhästar i lopp framför staplar som illustrerar Travanalys"
              src={vinst1}
              width={1536}
              height={1024}
              className="aspect-[3/2] w-full rounded-2xl object-cover"
            />
            <figcaption className="flex items-center gap-3 px-2 py-3 sm:px-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">Statistik möter travsport</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">Sju perspektiv till en samlad analys.</p>
              </div>
            </figcaption>
          </figure>
        </div>

        <dl className="mt-8 grid min-w-0 gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="analytics-section h-full">
              <dt>
                <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${feature.iconClassName}`} aria-hidden="true">
                  <feature.icon className="h-5 w-5" />
                </span>
                <span className="block text-sm font-bold leading-6 text-slate-800">{feature.name}</span>
              </dt>
              <dd className="mt-2 text-sm leading-7 text-slate-500">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
