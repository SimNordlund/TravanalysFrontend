import { useState } from "react";
import { BarChart3, ChevronDown, GraduationCap, MousePointer2, Radar, Trophy } from "lucide-react";
import HeroCarousel from "./HeroCarousel";
import skräll3 from "../Bilder/skräll3.png";
import skräll4 from "../Bilder/skräll4.png";

const perspectives = [
  { name: "Form", description: "Hästens prestationer ur olika perspektiv i en närtid." },
  { name: "Fart", description: "Hästens presterade tider över olika distanser med hänsyn till banunderlag, startspår och kusk." },
  { name: "Placering", description: "Hästens placeringar från det valda analysunderlaget." },
  { name: "Prestation", description: "En analys och översättning till en moralisk placering." },
  { name: "Motstånd", description: "Alltid svårare och meriterande att tävla mot hårt motstånd." },
  { name: "Klass", description: "Oftast mer utmanande att tävla i höga prisklasser." },
  { name: "Skrik", description: "Trender i analysunderlag och spekulationer som skvallrar om dold form." },
];

const guides = [
  {
    name: "Konsumtion av beslutsunderlaget",
    description:
      "De sju olika analysperspektiven visualiseras i ett spindeldiagram som tillsammans bildar ett totalt analysutfall i ett stapeldiagram. Högst stapel har högst vinstchans. Uppstickare hittas i spindeldiagrammets sju analysperspektiv som tillsammans kanske inte alltid innebär högst total.",
    icon: Radar,
    iconClassName: "border-sky-100 bg-sky-50 text-sky-700",
  },
  {
    name: "Navigering",
    description:
      "Klicka på en häst i stapeldiagrammet för att utforska de sju olika analysperspektiven. Markera en eller flera hästar inför beslut om att lägga till eller ta bort en häst.",
    icon: MousePointer2,
    iconClassName: "border-teal-100 bg-teal-50 text-teal-700",
  },
];

const slides = [skräll3, skräll4];

export default function IntroWithCarousel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      id="analysperspektiv"
      aria-labelledby="perspectives-title"
      className="scroll-mt-24 px-3 py-8 text-left sm:px-6 sm:py-12"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 px-1 sm:mb-8">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            <span className="h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
            Bakom analysen
          </p>
          <h2 id="perspectives-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Analysperspektiven<span className="text-indigo-500">.</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
            Lär känna de sju perspektiven och hur de tillsammans bildar hästens profil.
          </p>
        </header>

        <div className="grid min-w-0 items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <figure className="chart-panel min-w-0">
            <div className="chart-panel-heading">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700" aria-hidden="true">
                  <Trophy className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="chart-kicker">Från loppen</p>
                  <h3 className="chart-title">Exempel på resultat</h3>
                </div>
              </div>
            </div>
            <HeroCarousel
              slides={slides}
              auto
              interval={4000}
              className="mx-auto w-full max-w-md"
              heightClass="aspect-[3/4]"
              roundedClass="rounded-2xl border border-slate-200"
              fit="contain"
              imgClassName="p-3 pb-10 sm:p-4 sm:pb-10"
              letterboxBg="bg-slate-50"
            />
            <figcaption className="mt-4 text-xs leading-6 text-slate-500">
              Bläddra bland tidigare resultat med pilarna eller bildväljaren.
            </figcaption>
          </figure>

          <div className="analytics-section">
            <div className="chart-panel-heading">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white text-indigo-600 shadow-sm" aria-hidden="true">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="chart-kicker">Sju perspektiv</p>
                  <h3 className="chart-title">Vår analysmodell</h3>
                </div>
              </div>
            </div>

            <dl id="analysis-perspectives-list" className="divide-y divide-slate-100">
              {perspectives.map((perspective, index) => (
                <div
                  key={perspective.name}
                  className={`grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 py-3 first:pt-0 ${index >= 3 ? (isOpen ? "grid" : "hidden md:grid") : "grid"}`}
                >
                  <dt className="col-span-2 flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-[10px] font-bold tabular-nums text-indigo-600" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {perspective.name}
                  </dt>
                  <dd className="col-start-2 mt-1 min-w-0 text-xs leading-6 text-slate-500 sm:text-sm">{perspective.description}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              aria-expanded={isOpen}
              aria-controls="analysis-perspectives-list"
              className="chart-filter mt-3 w-full gap-2 md:hidden"
            >
              {isOpen ? "Visa färre perspektiv" : "Visa alla sju perspektiv"}
              <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-indigo-800">Analys – den samlade bilden</p>
                <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">
                  Den sammansatta vinstchansen visualiserad i ett stapeldiagram.
                </p>
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-5 grid min-w-0 gap-5 sm:mt-6 sm:gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <div key={guide.name} className="chart-panel">
              <dt className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${guide.iconClassName}`} aria-hidden="true">
                  <guide.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 pt-2 text-sm font-bold leading-6 text-slate-800">{guide.name}</span>
              </dt>
              <dd className="mt-3 text-sm leading-7 text-slate-500">{guide.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
