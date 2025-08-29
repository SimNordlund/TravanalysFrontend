import React, { useEffect, useState, useRef } from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import travhorsi from "./Bilder/travhorsi2.png";
import DatePicker from "./Components/DatePicker";
import Chart from "chart.js/auto";

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
  setVisibleHorseIdxes, // <-- NEW: to sync shared legend
}) => {
  const legendRef = useRef(null);
  const chartRef = useRef(null);

  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

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
  }, []);

  // HÄMTA ENDAST BAR-DATA
  useEffect(() => {
    if (!selectedLap) return;
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

        const datasets = await Promise.all(
          completeHorses.map(async (horse, idx) => {
            const rs = await fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`,
              { signal: ac.signal }
            );
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            const col = horseColors[idx % horseColors.length];
            return {
              label: `${horse.numberOfCompleteHorse}. ${horse.nameOfCompleteHorse}`,
              data: labels.map((_, i) => (i === idx ? fs.analys : null)),
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
  }, [selectedLap]);

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  // ✅ Restore: click a bar → show only that horse in Spider + Analys
  const handleBarClick = (evt) => {
    if (!chartRef.current) return;
    const els = getElementAtEvent(chartRef.current, evt);
    if (!els.length) return;
    const { datasetIndex } = els[0];
    setSelectedHorse(datasetIndex);
    setVisibleHorseIdxes?.([datasetIndex]); // sync shared legend selection
    setSelectedView("spider");
  };

  // Mobile legend (only for BarChart itself)
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
          if (chart.isDatasetVisible(item.datasetIndex)) {
            chart.hide(item.datasetIndex);
          } else {
            chart.show(item.datasetIndex);
          }
        };

        const box = document.createElement("span");
        box.className = "inline-block w-20 h-3 mr-2 rounded";
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
        labels: { boxWidth: 42 },
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
      ?.nameOfCompetition ?? "v75";

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
      <p className="sm:text-xl text-lg font-semibold text-slate-800 mt-1 mb-4 sm:mt-2 sm:mb-2 px-4 py-1 flex flex-col justify-center items-center">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8592;
        </button>

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          min={dates[0]?.date}
          max={dates[dates.length - 1]?.date}
        />

        <button
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8594;
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

      <div className="self-start flex flex-wrap justify-start items-center gap-1 mb-4">
        {laps.length > 0 ? (
          laps.map((lap) => (
            <button
              key={lap.id}
              onClick={() => setSelectedLap(lap.id)}
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
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

      <div className="w-full text-center mb-1">
        <p className="text-sm sm:text-base text-slate-700 font-semibold">
          Analys
        </p>
      </div>

      {/* BarChart-specific legend for phones only (unchanged) */}
      <div className="self-start flex flex-wrap">
        <ul
          ref={legendRef}
          className={
            isSmallScreen ? "grid grid-cols-1 gap-2 mb-2 text-xs" : "hidden"
          }
        />
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full sm:h-[35vh] h-[30vh] relative flex items-center justify-center">
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
    </div>
  );
};

export default BarChartComponent;
