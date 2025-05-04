// SpiderChart.jsx

import React, { useState, useEffect, useRef } from "react";
import { Radar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const SpiderChart = ({
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
  selectedHorse,
}) => {
  const horseColors = [
    "rgba(0, 0, 255, 0.5)",   "rgba(255, 165, 0, 0.5)",
    "rgba(255, 0, 0, 0.5)",   "rgba(0, 100, 0, 0.5)",
    "rgba(211, 211, 211, 0.5)","rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)", "rgba(173, 216, 230, 0.5)",
    "rgba(165, 42, 42, 0.5)", "rgba(0, 0, 139, 0.5)",
    "rgba(204, 204, 0, 0.5)", "rgba(105, 105, 105, 0.5)",
    "rgba(255, 192, 203, 0.5)","rgba(255, 140, 0, 0.5)",
    "rgba(128, 0, 128, 0.5)",
  ];

  const [data, setData] = useState({
    labels: ["Analys", "Tid", "Prestation", "Motstånd"],
    datasets: [],
  });
  const [loading, setLoading]     = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError]         = useState(null);

  const [dates, setDates]         = useState([]);
  const [tracks, setTracks]       = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps]           = useState([]);

  const legendRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const getLegendPosition = () => (window.innerWidth >= 640 ? "right" : "top");
  const [legendPosition, setLegendPosition] = useState(getLegendPosition());

  useEffect(() => {
    const onResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
      setLegendPosition(getLegendPosition());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 1. Dates
  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((r) => r.json())
      .then((d) => {
        setDates(d);
        if (!selectedDate && d.length) {
          const todayStr = new Date().toISOString().split("T")[0];
          const found = d.find((x) => x.date === todayStr);
          setSelectedDate(found ? found.date : d[0].date);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Tracks
  useEffect(() => {
    if (!selectedDate) return;
    fetch(`${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        setTracks(d);
        if (d.length) setSelectedTrack(d[0].id);
      })
      .catch(console.error);
  }, [selectedDate]);

  // 3. Competitions
  useEffect(() => {
    if (!selectedTrack) return;
    fetch(`${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`)
      .then((r) => r.json())
      .then((d) => {
        setCompetitions(d);
        if (d.length) setSelectedCompetition(d[0].id);
      })
      .catch(console.error);
  }, [selectedTrack]);

  // 4. Laps
  useEffect(() => {
    if (!selectedCompetition) return;
    fetch(`${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`)
      .then((r) => r.json())
      .then((d) => {
        setLaps(d);
        if (d.length) setSelectedLap(d[0].id);
      })
      .catch(console.error);
  }, [selectedCompetition]);

  // 5. Horse data + top5 logic
  useEffect(() => {
    if (!selectedLap) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`)
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((horses) =>
        Promise.all(
          horses.map((h, idx) =>
            fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${h.id}`)
              .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
              .then((fs) => ({ idx, name: h.nameOfCompleteHorse, fs }))
          )
        )
      )
      .then((arr) => {
        const raw = arr.map(({ idx, name, fs }) => ({
          label: `${idx + 1}. ${name}`,
          data: [fs.analys, fs.fart, fs.klass, fs.styrka],
          backgroundColor: horseColors[idx % horseColors.length],
          borderColor: horseColors[idx % horseColors.length].replace("0.5", "1"),
          borderWidth: 2,
          pointRadius: 2,
        }));

        // determine top 5 by analys
        const top5 = raw
          .map((ds, i) => ({ i, val: ds.data[0] }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 5)
          .map((x) => x.i);

        // hide logic
        const datasets = raw.map((ds, i) => ({
          ...ds,
          hidden: selectedHorse !== null ? i !== selectedHorse : !top5.includes(i),
        }));

        setData((d) => ({ ...d, datasets }));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLap, selectedHorse]);

  // spinner delay
  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  // custom HTML legend
  const htmlLegendPlugin = {
    id: "htmlLegend",
    afterUpdate: (chart) => {
      const ul = legendRef.current;
      if (!ul) return;
      ul.innerHTML = "";
      chart.data.datasets.forEach((ds, i) => {
        const li = document.createElement("li");
        li.className = "flex items-center cursor-pointer select-none whitespace-nowrap";
        const vis = chart.isDatasetVisible(i);
        li.style.opacity = vis ? 1 : 0.35;
        li.onclick = () => (vis ? chart.hide(i) : chart.show(i));
        const box = document.createElement("span");
        box.className = "inline-block w-7 h-3 mr-2 rounded";
        box.style.background = ds.backgroundColor;
        const txt = document.createElement("span");
        txt.textContent = ds.label;
        li.append(box, txt);
        ul.append(li);
      });
    },
  };

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

  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Title */}
      <p className="mb-4 px-4 py-2 bg-slate-100 rounded-xl border text-center font-semibold">
        {selectedDate} | {selectedTrack} | {selectedCompetition}
      </p>

      {/* custom legend (small screens) */}
      <ul
        ref={legendRef}
        className={isSmallScreen ? "grid grid-cols-3 gap-2 text-xs mb-4" : "hidden"}
      />

      {/* chart or spinner */}
      <div className="w-full max-w-md h-64 sm:h-80">
        {data.datasets.length > 0 && !loading ? (
          <Radar data={data} options={options} plugins={[htmlLegendPlugin]} />
        ) : loading && showSpinner ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
            <p className="mt-2 text-sm text-slate-500">Laddar…</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Ingen data hittades.</p>
        )}
      </div>

      {/* selectors */}
      <div className="mt-6 flex flex-wrap gap-2 bg-slate-50 p-4 rounded-xl border shadow">
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded">
          {dates.map((d) => (
            <option key={d.id} value={d.date}>{d.date}</option>
          ))}
        </select>
        <select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)} className="p-2 border rounded">
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>{t.nameOfTrack}</option>
          ))}
        </select>
        <select
          value={selectedCompetition}
          onChange={(e) => setSelectedCompetition(e.target.value)}
          className="p-2 border rounded"
        >
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.nameOfCompetition}</option>
          ))}
        </select>
        <select value={selectedLap} onChange={(e) => setSelectedLap(e.target.value)} className="p-2 border rounded">
          {laps.map((l) => (
            <option key={l.id} value={l.id}>{l.nameOfLap}</option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-red-600">Error: {error}</p>}
    </div>
  );
};

export default SpiderChart;
