// BarChartComponent.jsx
// (copy-paste the whole file)

import React, { useEffect, useState, useRef } from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";          //Changed!
import pappaCrazy from "./Bilder/PappaCrazy.png";
import Chart from "chart.js/auto";

const BarChartComponent = ({
  /* navigation props from ToggleComponent */
  selectedDate, setSelectedDate,
  selectedTrack, setSelectedTrack,
  selectedCompetition, setSelectedCompetition,
  selectedLap, setSelectedLap,
  /* cross-link props */
  setSelectedView,                                         //Changed!
  setSelectedHorse,                                        //Changed!
}) => {
  /* ---------- refs ---------- */
  const legendRef = useRef(null);
  const chartRef  = useRef(null);                           //Changed!

  /* ---------- state ---------- */
  const [data, setData]               = useState({ labels: [], datasets: [] });
  const [loading, setLoading]         = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError]             = useState(null);

  const [dates, setDates]         = useState([]);
  const [tracks, setTracks]       = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps]           = useState([]);

  /* ---------- colour palette ---------- */
  const horseColors = [
    "rgba(0, 0, 255, 0.5)","rgba(255, 165, 0, 0.5)","rgba(255, 0, 0, 0.5)",
    "rgba(0, 100, 0, 0.5)","rgba(211, 211, 211, 0.5)","rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)","rgba(173, 216, 230, 0.5)","rgba(165, 42, 42, 0.5)",
    "rgba(0, 0, 139, 0.5)","rgba(204, 204, 0, 0.5)","rgba(105, 105, 105, 0.5)",
    "rgba(255, 192, 203, 0.5)","rgba(255, 140, 0, 0.5)","rgba(128, 0, 128, 0.5)",
  ];

  /* ---------- responsive legend toggle ---------- */
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640); //Changed!
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);          //Changed!
    window.addEventListener("resize", onResize);                               //Changed!
    return () => window.removeEventListener("resize", onResize);               //Changed!
  }, []);                                                                      //Changed!

  /* ---------- API base ---------- */
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* ───────── 1. Dates ───────── */
  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((res) => res.json())
      .then((d) => {
        setDates(d);
        if (!selectedDate) {
          const todayStr = new Date().toISOString().split("T")[0];
          const today = d.find((x) => x.date === todayStr);
          if (today) setSelectedDate(today.date);
          else if (d.length) setSelectedDate(d[0].date);
        }
      })
      .catch((err) => console.error("dates:", err));
  }, []);

  /* ───────── 2. Tracks ───────── */
  useEffect(() => {
    if (!selectedDate) return;
    fetch(`${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        setTracks(d);
        if (d.length) setSelectedTrack(d[0].id);
      })
      .catch((err) => console.error("tracks:", err));
  }, [selectedDate]);

  /* ───────── 3. Competitions ───────── */
  useEffect(() => {
    if (!selectedTrack) return;
    fetch(`${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`)
      .then((r) => r.json())
      .then((d) => {
        setCompetitions(d);
        if (d.length) setSelectedCompetition(d[0].id);
      })
      .catch((err) => console.error("competitions:", err));
  }, [selectedTrack]);

  /* ───────── 4. Laps ───────── */
  useEffect(() => {
    if (!selectedCompetition) return;
    fetch(`${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`)
      .then((r) => r.json())
      .then((d) => {
        setLaps(d);
        const ok = d.some((l) => l.id === +selectedLap);
        if (!selectedLap || !ok) if (d.length) setSelectedLap(d[0].id);
      })
      .catch((err) => {
        console.error("laps:", err);
        setLaps([]);
      });
  }, [selectedCompetition]);

  /* ───────── 5. Horses + four-starts (bar data) ───────── */
  useEffect(() => {
    if (!selectedLap) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((completeHorses) => {
        const labels = completeHorses.map((_, i) => `${i + 1}.`);
        return Promise.all(
          completeHorses.map((horse, idx) =>
            fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
              .then((r) => {
                if (!r.ok) throw new Error(r.statusText);
                return r.json();
              })
              .then((fs) => {
                const col = horseColors[idx % horseColors.length];
                return {
                  label: `${idx + 1}. ${horse.nameOfCompleteHorse}`,
                  data: labels.map((_, i) => (i === idx ? fs.analys : null)),
                  backgroundColor: col,
                  borderColor: "rgba(0,0,0,1)",
                  borderWidth: 0.5,
                };
              })
          )
        ).then((datasets) => ({ labels, datasets }));
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLap]);

  /* ---- show spinner only after 3 s ---- */
  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  /* ---------- click-to-Spider handler ---------- */
  const handleBarClick = (evt) => {                                    //Changed!
    const els = getElementAtEvent(chartRef.current, evt);              //Changed!
    if (!els.length) return;                                           //Changed!
    const { datasetIndex } = els[0];                                   //Changed!
    setSelectedHorse(datasetIndex);                                    //Changed!
    setSelectedView("spider");                                         //Changed!
  };                                                                   //Changed!

  /* ---------- html legend (same logic as your version) ---------- */
  const htmlLegendPlugin = {
    id: "htmlLegend",
    afterUpdate(chart) {
      const ul = legendRef.current;
      if (!ul) return;
      while (ul.firstChild) ul.firstChild.remove();

      chart.legend.legendItems.forEach((item) => {
        const li = document.createElement("li");
        li.className = "flex items-center cursor-pointer";
        li.style.opacity = item.hidden ? 0.5 : 1;
        li.onclick = () => {
          chart.toggleDataVisibility(item.datasetIndex);
          chart.update();
        };
        const box = document.createElement("span");
        box.className = "inline-block w-7 h-3 mr-2 rounded";
        box.style.background = item.fillStyle;
        const text = document.createElement("span");
        text.textContent = item.text;
        li.appendChild(box);
        li.appendChild(text);
        ul.appendChild(li);
      });
    },
  };

  /* ---------- chart options ---------- */
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
    },
  };

  /* ---------- Swedish date helpers ---------- */
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today - 864e5).toISOString().split("T")[0];
  const tomorrowStr  = new Date(+today + 864e5).toISOString().split("T")[0];
  const fmt = (d) =>
    new Date(d).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" });

  const selectedDateLabel =
    selectedDate === todayStr
      ? `Idag, ${fmt(selectedDate)}`
      : selectedDate === yesterdayStr
      ? `Igår, ${fmt(selectedDate)}`
      : selectedDate === tomorrowStr
      ? `Imorgon, ${fmt(selectedDate)}`
      : fmt(selectedDate);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "Färjestad";
  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ?? "v75";

  /* ---------- dropdown handlers ---------- */
  const onDate  = (e) => setSelectedDate(e.target.value);
  const onTrack = (e) => setSelectedTrack(e.target.value);
  const onComp  = (e) => setSelectedCompetition(e.target.value);
  const onLap   = (e) => setSelectedLap(e.target.value);

  /* ---------- early error ---------- */
  if (error) return <div className="text-red-600">Error: {error}</div>;

  /* ---------- JSX ---------- */
  return (
    <div className="flex flex-col mt-1 px-2 pb-10 justify-center items-center">
      <p className="sm:text-xl text-lg font-semibold text-slate-700 mt-4 mb-4 sm:mt-2 sm:mb-7 px-4 py-2 flex flex-col justify-center items-center bg-slate-100">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p>

      {/* Lap buttons (unchanged) */}
      <div className="flex flex-wrap justify-start items-center gap-1 mb-4">
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
              {lap.nameOfLap}
            </button>
          ))
        ) : (
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded w-16 h-6 sm:w-20 sm:h-8 animate-pulse" />
            ))}
          </div>
        )}
      </div>

      {/* custom legend (<640 px) */}
      <ul ref={legendRef} className={isSmallScreen ? "grid grid-cols-3 gap-2 mb-2 text-xs" : "hidden"} />

      {/* bar chart / placeholders */}
      <div className="w-full flex justify-center">
        <div className="sm:w-[90vh] w-full sm:h-[45vh] h-[30vh] relative flex items-center justify-center">
          {data.datasets.length > 0 && !loading && (
            <Bar
              ref={chartRef}                  /* Changed! */
              data={data}
              options={options}
              plugins={isSmallScreen ? [htmlLegendPlugin] : []}
              onClick={handleBarClick}        /* Changed! */
            />
          )}

          {!loading && data.datasets.length === 0 && (
            <div className="text-sm text-slate-500">Finns ingen data.</div>
          )}

          {showSpinner && loading && (
            <div className="flex flex-col items-center">
              <img src={pappaCrazy} alt="Loading…" className="h-24 w-24 animate-spin" />
              <span className="mt-2 text-sm text-slate-500">Grubblar…</span>
            </div>
          )}
        </div>
      </div>

      {/* dropdowns */}
      <div className="w-full flex justify-center">
        <div className="flex flex-col justify-center items-center w-full sm:w-[65%] space-y-4 mt-8 sm:mt-4 sm:flex-row sm:space-y-0 sm:space-x-2 bg-slate-50 sm:p-4 rounded-xl border shadow-md">
          <select value={selectedDate} onChange={onDate}  className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
            <option value="" disabled>Välj datum</option>
            {dates.map((d) => <option key={d.id} value={d.date}>{d.date}</option>)}
          </select>

          <select value={selectedTrack} onChange={onTrack} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
            <option value="" disabled>Välj bana</option>
            {tracks.map((t) => <option key={t.id} value={t.id}>{t.nameOfTrack}</option>)}
          </select>

          <select value={selectedCompetition} onChange={onComp} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
            <option value="" disabled>Välj spelform</option>
            {competitions.map((c) => <option key={c.id} value={c.id}>{c.nameOfCompetition}</option>)}
          </select>

          <select value={selectedLap} onChange={onLap} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
            <option value="" disabled>Välj lopp</option>
            {laps.map((l) => <option key={l.id} value={l.id}>{l.nameOfLap}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default BarChartComponent;
