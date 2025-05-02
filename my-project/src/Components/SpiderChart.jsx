// SpiderChart.jsx
// (copy–paste the whole file)

import React, { useState, useEffect, useRef } from "react";
import { Radar } from "react-chartjs-2";
import Chart from "chart.js/auto";

// ▶ SpiderChart – auto-selects first date → track → competition → lap
//   and (if selectedHorse !== null) hides all horses except that one.

const SpiderChart = ({
  /* navigation props from ToggleComponent */
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
  /* one-horse filter coming from BarChart */
  selectedHorse, //Changed!
}) => {
  /* ---------- colour palette ---------- */
  const horseColors = [
    "rgba(0, 0, 255, 0.5)",  "rgba(255, 165, 0, 0.5)", "rgba(255, 0, 0, 0.5)",
    "rgba(0, 100, 0, 0.5)",  "rgba(211, 211, 211, 0.5)", "rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)","rgba(173, 216, 230, 0.5)", "rgba(165, 42, 42, 0.5)",
    "rgba(0, 0, 139, 0.5)",  "rgba(204, 204, 0, 0.5)",  "rgba(105, 105, 105, 0.5)",
    "rgba(255, 192, 203, 0.5)","rgba(255, 140, 0, 0.5)","rgba(128, 0, 128, 0.5)",
  ];

  /* ---------- state ---------- */
  const [data, setData] = useState({
    labels: ["Analys", "Tid", "Prestation", "Motstånd"],
    datasets: [],
  });
  const [loading, setLoading]       = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError]           = useState(null);

  const [dates, setDates]           = useState([]);
  const [tracks, setTracks]         = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps]             = useState([]);

  /* ---------- responsive legend ---------- */
  const legendRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getLegendPosition = () => (window.innerWidth >= 640 ? "right" : "top");
  const [legendPosition, setLegendPosition] = useState(getLegendPosition());
  useEffect(() => {
    const r = () => setLegendPosition(getLegendPosition());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

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

  /* ───────── 5. Horses + four-starts ───────── */
  useEffect(() => {
    if (!selectedLap) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((completeHorses) =>
        Promise.all(
          completeHorses.map((horse, idx) =>
            fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
              .then((r) => {
                if (!r.ok) throw new Error(r.statusText);
                return r.json();
              })
              .then((fs) => ({
                label: `${idx + 1}. ${horse.nameOfCompleteHorse}`,
                data: [fs.analys, fs.fart, fs.klass, fs.styrka], //Changed!
                backgroundColor: horseColors[idx % horseColors.length],
                borderColor: horseColors[idx % horseColors.length].replace("0.5", "1"),
                borderWidth: 2,
                pointRadius: 2,
                hidden: selectedHorse !== null && idx !== selectedHorse, //Changed!
              }))
          )
        )
      )
      .then((datasets) => {
        setData((p) => ({ ...p, datasets }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLap, selectedHorse]); //Changed!

  /* ---- show spinner only after 3 s ---- */
  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  /* ---------- custom HTML legend ---------- */
  const htmlLegendPlugin = {
    id: "htmlLegend",
    afterUpdate(chart) {
      const ul = legendRef.current;
      if (!ul) return;

      while (ul.firstChild) ul.firstChild.remove();

      chart.data.datasets.forEach((ds, idx) => {
        const li = document.createElement("li");
        li.className =
          "flex items-center cursor-pointer select-none whitespace-nowrap";
        const visible = chart.isDatasetVisible(idx);
        li.style.opacity = visible ? 1 : 0.35;

        li.onclick = () => {
          chart.setDatasetVisibility(idx, !chart.isDatasetVisible(idx));
          chart.update();
        };

        const box = document.createElement("span");
        box.className = "inline-block w-7 h-3 mr-2 rounded";
        box.style.background = ds.backgroundColor;

        const text = document.createElement("span");
        text.textContent = ds.label;

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
    plugins: {
      legend: { display: !isSmallScreen, position: isSmallScreen ? "top" : legendPosition },
    },
    scales: {
      r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 100 },
    },
    elements: { line: { borderWidth: 2 } },
  };

  /* ---------- nice Swedish labels ---------- */
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today - 864e5).toISOString().split("T")[0];
  const tomorrowStr   = new Date(+today + 864e5).toISOString().split("T")[0];

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
  const selectedLapLabel = laps.find((l) => l.id === +selectedLap)?.nameOfLap ?? "Lopp 1";

  /* ---------- handlers ---------- */
  const handleDate = (e) => setSelectedDate(e.target.value);
  const handleTrack = (e) => setSelectedTrack(e.target.value);
  const handleComp  = (e) => setSelectedCompetition(e.target.value);
  const handleLap   = (e) => setSelectedLap(e.target.value);

  /* ---------- JSX ---------- */
  return (
    <div className="flex flex-col justify-center items-center mt-1 px-2 pb-10">
      <p className="sm:text-xl text-lg font-semibold text-slate-700 mt-4 mb-4 sm:mt-2 sm:mb-2 px-4 py-2 flex flex-col justify-center items-center bg-slate-100">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p>

      {/* custom legend on small screens */}
      <ul
        ref={legendRef}
        className={
          isSmallScreen ? "relative z-10 grid grid-cols-3 gap-2 text-xs" : "hidden"
        }
      />

      {/* radar / placeholders */}
      <div className="relative w-full sm:w-[300px] md:w-[500px] h-[40vh] sm:h-[40vh] md:h-[50vh] flex items-center justify-center">
        {data.datasets.length > 0 && !loading && (
          <Radar data={data} options={options} plugins={[htmlLegendPlugin]} />
        )}

        {!loading && data.datasets.length === 0 && (
          <div className="text-sm text-slate-500">No data found for this lap.</div>
        )}

        {showSpinner && loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
            <span className="mt-2 text-sm text-slate-500">Grubblar…</span>
          </div>
        )}
      </div>

      {/* dropdowns */}
      <div className="flex flex-col w-full sm:w-auto space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 bg-slate-50 sm:p-4 rounded-xl border shadow-md mt-4 sm:mt-8">
        <select value={selectedDate} onChange={handleDate} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj datum</option>
          {dates.map((d) => (
            <option key={d.id} value={d.date}>{d.date}</option>
          ))}
        </select>

        <select value={selectedTrack} onChange={handleTrack} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj bana</option>
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>{t.nameOfTrack}</option>
          ))}
        </select>

        <select value={selectedCompetition} onChange={handleComp} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj spelform</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.nameOfCompetition}</option>
          ))}
        </select>

        <select value={selectedLap} onChange={handleLap} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj lopp</option>
          {laps.map((l) => (
            <option key={l.id} value={l.id}>{l.nameOfLap}</option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-600 mt-4">Error: {error}</div>}
    </div>
  );
};

export default SpiderChart;
