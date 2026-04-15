import React, { useEffect, useState, useRef } from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import DatePicker from "./Components/DatePicker";
import Chart from "chart.js/auto";
import { ChevronLeft, ChevronRight } from "lucide-react"; 

Chart.defaults.font.family =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'";
Chart.defaults.font.weight = 400;

const horseRunLoaderStyles = `
.horse-run-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10rem;
  height: 7rem;
}

.horse-run-loader__svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.horse-run-loader__horse {
  animation: horse-loader-body 640ms cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transform-origin: 80px 58px;
}

.horse-run-loader__body,
.horse-run-loader__head,
.horse-run-loader__tail {
  fill: #4f46e5;
}

.horse-run-loader__mane,
.horse-run-loader__leg {
  fill: none;
  stroke: #312e81;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.horse-run-loader__mane {
  stroke-width: 4;
}

.horse-run-loader__head {
  animation: horse-loader-head 640ms cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transform-box: fill-box;
  transform-origin: 20% 70%;
}

.horse-run-loader__tail {
  animation: horse-loader-tail 520ms cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transform-box: fill-box;
  transform-origin: 90% 45%;
}

.horse-run-loader__leg {
  stroke-width: 7;
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation-duration: 520ms;
  animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
  animation-iteration-count: infinite;
}

.horse-run-loader__leg--far {
  stroke: #6366f1;
  stroke-width: 6;
  opacity: 0.7;
}

.horse-run-loader__leg--front-a {
  animation-name: horse-loader-front-a;
}

.horse-run-loader__leg--front-b {
  animation-name: horse-loader-front-b;
}

.horse-run-loader__leg--back-a {
  animation-name: horse-loader-back-a;
}

.horse-run-loader__leg--back-b {
  animation-name: horse-loader-back-b;
}

.horse-run-loader__shadow {
  fill: #0f172a;
  opacity: 0.12;
  animation: horse-loader-shadow 640ms cubic-bezier(0.45, 0, 0.55, 1) infinite;
  transform-origin: 80px 96px;
}

.horse-run-loader__track-line {
  animation: horse-loader-ground 720ms linear infinite;
  stroke: #94a3b8;
  stroke-linecap: round;
  stroke-width: 3;
}

.horse-run-loader__track-line--two {
  animation-delay: -240ms;
}

.horse-run-loader__track-line--three {
  animation-delay: -480ms;
}

@keyframes horse-loader-body {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes horse-loader-head {
  0%, 100% {
    transform: rotate(-2deg) translateY(0);
  }
  50% {
    transform: rotate(3deg) translateY(2px);
  }
}

@keyframes horse-loader-tail {
  0%, 100% {
    transform: rotate(-9deg);
  }
  50% {
    transform: rotate(12deg);
  }
}

@keyframes horse-loader-front-a {
  0%, 100% {
    transform: rotate(24deg);
  }
  50% {
    transform: rotate(-26deg) translateY(2px);
  }
}

@keyframes horse-loader-front-b {
  0%, 100% {
    transform: rotate(-22deg) translateY(2px);
  }
  50% {
    transform: rotate(26deg);
  }
}

@keyframes horse-loader-back-a {
  0%, 100% {
    transform: rotate(-24deg) translateY(2px);
  }
  50% {
    transform: rotate(26deg);
  }
}

@keyframes horse-loader-back-b {
  0%, 100% {
    transform: rotate(24deg);
  }
  50% {
    transform: rotate(-26deg) translateY(2px);
  }
}

@keyframes horse-loader-shadow {
  0%, 100% {
    transform: scaleX(1);
    opacity: 0.12;
  }
  50% {
    transform: scaleX(0.78);
    opacity: 0.08;
  }
}

@keyframes horse-loader-ground {
  0% {
    transform: translateX(32px);
    opacity: 0;
  }
  20%, 75% {
    opacity: 0.75;
  }
  100% {
    transform: translateX(-40px);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .horse-run-loader__horse,
  .horse-run-loader__head,
  .horse-run-loader__tail,
  .horse-run-loader__leg,
  .horse-run-loader__shadow,
  .horse-run-loader__track-line {
    animation-duration: 1.4s;
  }
}
`;

const HorseRunLoader = () => (
  <div className="horse-run-loader" role="status" aria-label="Laddar diagram">
    <style>{horseRunLoaderStyles}</style>
    <svg
      className="horse-run-loader__svg"
      viewBox="0 0 160 110"
      aria-hidden="true"
      focusable="false"
    >
      <g>
        <path
          className="horse-run-loader__track-line"
          d="M10 96 H54"
        />
        <path
          className="horse-run-loader__track-line horse-run-loader__track-line--two"
          d="M68 100 H116"
        />
        <path
          className="horse-run-loader__track-line horse-run-loader__track-line--three"
          d="M28 103 H74"
        />
      </g>
      <ellipse
        className="horse-run-loader__shadow"
        cx="80"
        cy="96"
        rx="48"
        ry="7"
      />
      <g className="horse-run-loader__horse">
        <path
          className="horse-run-loader__tail"
          d="M38 48 C23 39 13 48 5 48 C15 60 28 62 42 54 Z"
        />
        <path
          className="horse-run-loader__body"
          d="M38 49 C45 38 60 36 74 40 C86 44 99 39 111 48 C118 54 116 64 107 68 C88 73 61 72 43 65 C35 62 32 55 38 49 Z"
        />
        <g className="horse-run-loader__head">
          <path d="M104 48 C109 34 120 24 132 23 C141 22 150 29 151 36 C141 37 133 34 126 39 C121 43 118 50 113 56 Z" />
          <path
            className="horse-run-loader__mane"
            d="M114 43 C118 35 124 28 132 24"
          />
          <circle cx="139" cy="31" r="1.8" fill="#eef2ff" />
        </g>
        <path
          className="horse-run-loader__leg horse-run-loader__leg--far horse-run-loader__leg--back-b"
          d="M65 64 C72 71 78 79 82 89 M82 89 L92 90"
        />
        <path
          className="horse-run-loader__leg horse-run-loader__leg--far horse-run-loader__leg--front-b"
          d="M91 65 C86 73 80 81 72 90 M72 90 L62 91"
        />
        <path
          className="horse-run-loader__leg horse-run-loader__leg--back-a"
          d="M52 63 C47 72 40 80 34 90 M34 90 L23 90"
        />
        <path
          className="horse-run-loader__leg horse-run-loader__leg--front-a"
          d="M104 64 C109 73 116 81 126 90 M126 90 L138 90"
        />
      </g>
    </svg>
    <span className="sr-only">Laddar diagram</span>
  </div>
);

const BarChartComponent = ({
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
  dates,
  tracks,
  competitions,
  laps,
  setSelectedView,
  setSelectedHorse,
  setVisibleHorseIdxes,
  startsCount,
  setStartsCount,
  setLegendMode,
}) => {
  const legendRef = useRef(null);
  const chartRef = useRef(null);

  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const [availableCounts, setAvailableCounts] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  const normalizeStarter = (v) => String(v ?? "").trim() || "0"; 

  const starterLabel = (starter) => {
    
    const s = normalizeStarter(starter); 
    if (s === "0") return "Analys"; 
    return s; 
  };

  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () => idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () =>
    idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);

  const horseColors = [
    "rgba(0, 0, 255, 0.5)",
    "rgba(255, 165, 0, 0.5)",
    "rgba(255, 0, 0, 0.5)",
    "rgba(0, 100, 0, 0.5)",
    "rgba(211, 211, 211, 0.5)",
    "rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)",
    "rgba(173, 216, 230, 0.5)",
    "rgba(165, 42, 42, 0.5)",
    "rgba(0, 0, 139, 0.5)",
    "rgba(204, 204, 0, 0.5)",
    "rgba(105, 105, 105, 0.5)",
    "rgba(255, 192, 203, 0.5)",
    "rgba(255, 140, 0, 0.5)",
    "rgba(128, 0, 128, 0.5)",
  ];

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!API_BASE_URL) {
      setError("VITE_API_BASE_URL saknas. Lägg till den i .env och starta om.");
    }
  }, [API_BASE_URL]); 

  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return;
    const ac = new AbortController();
    setAvailLoading(true);

    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/starts/available?lapId=${selectedLap}`,
          { signal: ac.signal }
        );
        if (!r.ok) throw new Error(r.statusText);

        const countsRaw = await r.json(); 
        const counts = (Array.isArray(countsRaw) ? countsRaw : []) 
          .map((c) => normalizeStarter(c)); 

        setAvailableCounts(counts); 

        const current = normalizeStarter(startsCount); 
        if (counts.length && !counts.includes(current)) {
          
          setStartsCount(counts[0]); 
        }
      } catch {
      } finally {
        if (!ac.signal.aborted) setAvailLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, API_BASE_URL, startsCount, setStartsCount]); 

  // HÄMTA ENDAST BAR-DATA
  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return; 
    const ac = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`,
          { signal: ac.signal }
        );
        if (!r.ok) throw new Error(r.statusText);
        const completeHorses = await r.json();
        const labels = completeHorses.map((h) => `${h.numberOfCompleteHorse}.`);

        const starterParam = encodeURIComponent(normalizeStarter(startsCount)); 

        const datasets = await Promise.all(
          completeHorses.map(async (horse, idx) => {
            const rs = await fetch(
              `${API_BASE_URL}/starts/findData?completeHorseId=${horse.id}&starter=${starterParam}`, 
              { signal: ac.signal }
            );
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            const col = horseColors[idx % horseColors.length];
            return {
              label: `${horse.numberOfCompleteHorse}. ${horse.nameOfCompleteHorse}`,
              data: labels.map((_, i) => (i === idx ? fs?.analys ?? 0 : null)),
              backgroundColor: col,
              borderColor: "rgba(0,0,0,1)",
              borderWidth: 0.5,
            };
          })
        );

        if (!ac.signal.aborted) {
          setData({ labels, datasets });
          setLoading(false);
        }
      } catch (e) {
        if (ac.signal.aborted) return;
        console.error("data:", e);
        setError(e.message);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, startsCount, API_BASE_URL]); 

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  const handleBarClick = (evt) => {
    if (!chartRef.current) return;
    const els = getElementAtEvent(chartRef.current, evt);
    if (!els.length) return;
    const { datasetIndex } = els[0];
    setSelectedHorse(datasetIndex);
    setVisibleHorseIdxes?.([datasetIndex]);
    setLegendMode?.("all");
    setSelectedView("spider");
  };

  // Mobile legend
  const htmlLegendPlugin = {
    id: "htmlLegend",
    afterUpdate(chart) {
      const ul = legendRef.current;
      if (!ul) return;
      while (ul.firstChild) ul.firstChild.remove();

      chart.legend.legendItems.forEach((item) => {
        const li = document.createElement("li");
        li.className = "flex items-center cursor-pointer";
        const visible = chart.isDatasetVisible(item.datasetIndex);
        li.style.opacity = visible ? 1 : 0.35;

        li.onclick = () => {
          if (chart.isDatasetVisible(item.datasetIndex))
            chart.hide(item.datasetIndex);
          else chart.show(item.datasetIndex);
        };

        const box = document.createElement("span");
        box.className =
          "inline-block w-20 h-3 mr-2 rounded border border-slate-500";
        box.style.background = item.fillStyle;

        const text = document.createElement("span");
        text.textContent = item.text;
        li.appendChild(box);
        li.appendChild(text);
        ul.appendChild(li);
      });
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, minBarLength: 10 },
      x: {
        stacked: true,
        ticks: { autoSkip: false, maxRotation: 0, padding: 2 },
      },
    },
    plugins: {
      legend: {
        display: !isSmallScreen,
        position: isSmallScreen ? "top" : "right",
        align: "start",
        labels: {
          boxWidth: 42,
          color: "#000",
          font: { family: Chart.defaults.font.family, weight: 370, size: 12 },
        },
      },
      tooltip: { enabled: true, callbacks: { title: () => "Analys" } },
    },
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today - 864e5).toISOString().split("T")[0];
  const tomorrowStr = new Date(+today + 864e5).toISOString().split("T")[0];

  const fmt = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const weekday = date.toLocaleDateString("sv-SE", { weekday: "long" });
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const rest = date.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
    });
    return `${capitalizedWeekday}, ${rest}`;
  };

  const selectedDateLabel = !selectedDate
    ? "Laddar datum…"
    : selectedDate === todayStr
    ? `Idag, ${fmt(selectedDate)}`
    : selectedDate === yesterdayStr
    ? `Igår, ${fmt(selectedDate)}`
    : selectedDate === tomorrowStr
    ? `Imorgon, ${fmt(selectedDate)}`
    : fmt(selectedDate);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "Färjestad";

  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "v85";

  const compName =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "";

  const lapPrefix = /proposition/i.test(compName)
    ? "Prop"
    : /^(vinnare|plats)$/i.test(compName.trim())
    ? "Lopp"
    : "Avd";

  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-screen-none px-2 pt-5 sm:py-4 relative">
      <p className="sm:text-xl text-lg font-semibold text-slate-800 mt-1 mb-4 sm:mt-2 sm:mb-5 px-4 py-1 flex flex-col justify-center items-center">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p>

      <div className="flex items-center justify-between sm:justify-self-center mb-4">
        <button
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          className="mb-1 mr-6 sm:mr-8 inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 [stroke-width:3]" />
        </button>

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          min={dates[0]?.date}
          max={dates[dates.length - 1]?.date}
          availableDates={dates.map((d) => d.date)}
        />

        <button
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          className="mb-1 ml-6 sm:ml-8 inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 [stroke-width:3]" />
        </button>
      </div>

      <div className="self-start flex flex-wrap gap-1 mb-2">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              t.id === +selectedTrack
                ? "bg-emerald-500 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {t.nameOfTrack}
          </button>
        ))}
      </div>

      <div className="self-start flex flex-wrap gap-1 mb-2">
        {competitions.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompetition(c.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              c.id === +selectedCompetition
                ? "bg-teal-600 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {c.nameOfCompetition}
          </button>
        ))}
      </div>

      <div className="self-start flex flex-wrap justify-start items-center gap-1 mb-0 sm:mb-4">
        {laps.length > 0 ? (
          laps.map((lap) => {
            
            const lapNo = String(lap.nameOfLap).trim(); 
            const lapText = isSmallScreen
              ? `${lapPrefix}${lapNo}` 
              : `${lapPrefix} ${lapNo}`; 

            return (
              <button
                key={lap.id}
                onClick={() => setSelectedLap(lap.id)}
                disabled={loading}
                className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded mb-1 sm:mb-0 ${
                  lap.id === +selectedLap
                    ? "bg-indigo-500 hover:bg-indigo-700 text-white font-semibold shadow focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-200"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {lapText} 
              </button>
            ); 
          }) 
        ) : (
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-300 rounded w-16 h-6 sm:w-20 sm:h-8 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-full text-center mb-1 hidden sm:block">
        <p className="text-sm sm:text-base text-slate-700 font-bold">
          Total analys och övergripande beslutsunderlag
        </p>
      </div>

      <div className="self-start flex flex-wrap">
        <ul
          ref={legendRef}
          className={
            isSmallScreen ? "grid grid-cols-1 gap-2 mb-2 text-xs" : "hidden"
          }
        />
      </div>

      <div className="w-full text-center mb-1 sm:hidden">
        <p className="text-sm sm:text-base text-slate-700 font-bold">
          Total analys och övergripande beslutsunderlag
        </p>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full h-[240px] sm:h-[340px] relative flex items-center justify-center">
          {data.datasets.length > 0 && !loading && (
            <Bar
              ref={chartRef}
              data={data}
              options={options}
              plugins={isSmallScreen ? [htmlLegendPlugin] : []}
              onClick={handleBarClick}
            />
          )}

          {!loading && data.datasets.length === 0 && (
            <div className="text-sm text-slate-500">Finns ingen data.</div>
          )}

          {showSpinner && loading && (
            <HorseRunLoader />
          )}
        </div>
      </div>

      <div className="self-start flex flex-wrap justify-start items-center gap-1 mb-0 mt-3 sm:mt-4 min-h-[40px]">
        {!availLoading &&
          availableCounts.map((n) => (
            <button
              key={String(n)} 
              onClick={() => setStartsCount(String(n))} 
              disabled={loading}
              className={`mt-0.5 sm:mb:0 px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                normalizeStarter(startsCount) === normalizeStarter(n) 
                  ? "bg-blue-500 hover:bg-blue-700 text-white font-semibold shadow focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {starterLabel(n)}
            </button>
          ))}
      </div>
    </div>
  );
};

export default BarChartComponent;
