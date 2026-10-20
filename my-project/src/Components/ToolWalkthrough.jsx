import { useRef, useState } from "react";
import { ArrowRight, ChevronDown, Film, Play } from "lucide-react";
import { Link } from "react-router-dom";
import walkthrough from "../data/toolWalkthrough.json";

const mediaPath = `${import.meta.env.BASE_URL}videos/travanalys-guide`;
const videoUrl = `${mediaPath}.webm?v=${walkthrough.mediaVersion}`;
const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export default function ToolWalkthrough() {
  const videoRef = useRef(null);
  const pendingSeek = useRef(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [playbackMessage, setPlaybackMessage] = useState("");

  const seekToChapter = async (index) => {
    const video = videoRef.current;
    if (!video) return;

    pendingSeek.current = walkthrough.chapters[index].start;
    if (video.readyState >= 1) {
      video.currentTime = pendingSeek.current;
      pendingSeek.current = null;
    }
    setActiveChapter(index);
    setPlaybackMessage("");
    try {
      await video.play();
    } catch {
      setPlaybackMessage("Tryck på uppspelningsknappen i videon för att fortsätta.");
    }
  };

  const handleLoadedMetadata = () => {
    if (pendingSeek.current !== null && videoRef.current) {
      videoRef.current.currentTime = pendingSeek.current;
      pendingSeek.current = null;
    }
  };

  const handleTimeUpdate = () => {
    const time = videoRef.current?.currentTime ?? 0;
    const index = walkthrough.chapters.findIndex(
      (chapter) => time >= chapter.start && time < chapter.end,
    );
    setActiveChapter(index === -1 ? walkthrough.chapters.length - 1 : index);
  };

  return (
    <section
      id="videoguide"
      aria-labelledby="walkthrough-title"
      className="scroll-mt-24 px-3 py-8 text-left sm:px-6 sm:py-12"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 px-1 sm:mb-8">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            <span className="h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
            Kom igång
          </p>
          <h2 id="walkthrough-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Så använder du Travanalys<span className="text-indigo-500">.</span>
          </h2>
          <p id="walkthrough-description" className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Följ med från loppval till analys, spindeldiagram, ranking och ROI.
            En illustrerad genomgång med exempeldata, svensk berättarröst och undertexter.
          </p>
        </header>

        <div className="analytics-section">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Film className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              Videoguide
            </span>
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {Math.floor(walkthrough.duration / 60)} min {walkthrough.duration % 60} sek · Svenska
            </span>
          </div>

          <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="min-w-0">
              <video
                id="travanalys-guide-video"
                ref={videoRef}
                controls
                playsInline
                preload="none"
                poster={`${mediaPath}-poster.jpg`}
                aria-label="Videoguide med svensk berättarröst: så använder du Travanalys"
                aria-describedby="walkthrough-description"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onError={() => setPlaybackMessage("Videon kunde inte spelas upp. Du kan ladda ner den eller läsa genomgången i textform nedan.")}
                className="aspect-video w-full rounded-2xl border border-slate-200 bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <source
                  src={videoUrl}
                  type="video/webm"
                  onError={() => setPlaybackMessage("Videon kunde inte laddas. Försök igen eller läs genomgången i textform nedan.")}
                />
                <track kind="captions" src={`${mediaPath}.sv.vtt?v=${walkthrough.mediaVersion}`} srcLang="sv" label="Svenska" />
                Din webbläsare kan inte spela upp videon. Använd länken nedan eller läs guiden i textform.
              </video>
              <p role="status" className="mt-2 text-xs leading-5 text-slate-500">{playbackMessage}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              </div>
            </div>

            <nav aria-label="Kapitel i videoguiden">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Hoppa till ett kapitel</p>
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {walkthrough.chapters.map((chapter, index) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      onClick={() => seekToChapter(index)}
                      aria-current={activeChapter === index ? "step" : undefined}
                      aria-controls="travanalys-guide-video"
                      aria-label={`${chapter.title}, ${formatTime(chapter.start)}`}
                      className={`flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none ${activeChapter === index ? "border-indigo-200 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"}`}
                    >
                      <Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 font-semibold">{chapter.title}</span>
                      <span className="shrink-0 text-[10px] tabular-nums opacity-70">{formatTime(chapter.start)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <details className="group mt-6 border-t border-slate-100 pt-5">
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              Läs genomgången i textform
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <ol className="mt-4 grid gap-5 sm:grid-cols-2">
              {walkthrough.chapters.map((chapter) => (
                <li key={chapter.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-800">{chapter.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{chapter.narration ?? chapter.instruction}</p>
                </li>
              ))}
            </ol>
          </details>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="text-xs leading-6 text-slate-500">Redo att prova med ett eget lopp?</p>
            <Link to="/chart/analys" className="chart-filter chart-filter-analysis gap-2">
              Öppna analysen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
