import React, { useEffect, useState, useRef } from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import travhorsi from "./Bilder/travhorsi2.png";
import DatePicker from "./Components/DatePicker";
import Chart from "chart.js/auto";
import { ChevronLeft, ChevronRight } from "lucide-react"; //Changed! (tog bort Weight som inte används)

Chart.defaults.font.family =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'";
Chart.defaults.font.weight = 400;

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

  const normalizeStarter = (v) => String(v ?? "").trim() || "0"; //Changed!

  const starterLabel = (starter) => { //Changed!
    const s = normalizeStarter(starter); //Changed!
    if (s === "0") return "Analys"; //Changed!
    return s; //Changed! (tog bort hårdkodat "start"/"starter")
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
  }, [API_BASE_URL]); //Changed!

  // Hämta vilka "starter" som finns för loppet (nu som STRINGS)
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

        const countsRaw = await r.json(); //Changed!
        const counts = (Array.isArray(countsRaw) ? countsRaw : []) //Changed!
          .map((c) => normalizeStarter(c)); //Changed!

        setAvailableCounts(counts); //Changed!

        const current = normalizeStarter(startsCount); //Changed!
        if (counts.length && !counts.includes(current)) { //Changed!
          setStartsCount(counts[0]); //Changed!
        }
      } catch {
      } finally {
        if (!ac.signal.aborted) setAvailLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, API_BASE_URL, startsCount, setStartsCount]); //Changed!

  // HÄMTA ENDAST BAR-DATA
  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return; //Changed!
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

        const starterParam = encodeURIComponent(normalizeStarter(startsCount)); //Changed!

        const datasets = await Promise.all(
          completeHorses.map(async (horse, idx) => {
            const rs = await fetch(
              `${API_BASE_URL}/starts/findData?completeHorseId=${horse.id}&starter=${starterParam}`, //Changed!
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
  }, [selectedLap, startsCount, API_BASE_URL]); //Changed!

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
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ??
    "v75";

  const compName =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ??
    "";

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
          laps.map((lap) => (
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
              {`${lapPrefix} ${lap.nameOfLap}`}
            </button>
          ))
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
            <div className="flex flex-col items-center">
              <img
                src={travhorsi}
                alt="Loading…"
                className="h-24 w-24 animate-spin"
              />
            </div>
          )}
        </div>
      </div>

      <div className="self-start flex flex-wrap justify-start items-center gap-1 mb-0 mt-3 sm:mt-4 min-h-[40px]">
        {!availLoading &&
          availableCounts.map((n) => (
            <button
              key={String(n)} //Changed!
              onClick={() => setStartsCount(String(n))} //Changed!
              disabled={loading}
              className={`mt-0.5 sm:mb:0 px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                normalizeStarter(startsCount) === normalizeStarter(n) //Changed!
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
