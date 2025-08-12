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

  const [data, setData] = useState({
    labels: ["Tid", "Prestation", "Motstånd", "Skrik", "Klass"],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);

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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((res) => res.json())
      .then((all) => {
        if (!all.length) return;

        const unique = Array.from(
          new Map(all.map((d) => [d.date, d])).values()
        ).sort((a, b) => a.date.localeCompare(b.date));

        setDates(unique);

        if (!selectedDate) {
          const todayStr = new Date().toISOString().split("T")[0];
          const todayObj = unique.find((d) => d.date === todayStr);
          setSelectedDate(todayObj ? todayObj.date : unique[0].date);
        }
      })
      .catch((err) => console.error("dates:", err));
  }, []);

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

  useEffect(() => {
    if (!selectedCompetition) return;
    fetch(
      `${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`
    )
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
            fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`
            )
              .then((r) => {
                if (!r.ok) throw new Error(r.statusText);
                return r.json();
              })
              .then((fs) => ({ idx, horse, fs }))
          )
        )
      )
      .then((arr) => {
        const rawDatasets = arr.map(({ idx, horse, fs }) => ({
          label: `${horse.numberOfCompleteHorse}. ${horse.nameOfCompleteHorse}`,
          data: [
            fs.fart,
            fs.styrka,
            fs.klass,
            fs.kusk,
            fs.prispengar,
            fs.placering,
            fs.form
          ] /*mn kuk är bejs send hekp xd */,
          backgroundColor: horseColors[idx % horseColors.length],
          borderColor: horseColors[idx % horseColors.length].replace(
            "0.5",
            "1"
          ),
          borderWidth: 2,
          pointRadius: 2,
        }));

        const top5Idx = rawDatasets
          .map((ds, i) => ({ i, val: ds.data[0] }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 5)
          .map((x) => x.i);

        const datasets = rawDatasets.map((ds, i) => ({
          ...ds,
          hidden:
            selectedHorse !== null ? i !== selectedHorse : !top5Idx.includes(i),
        }));

        setData((p) => ({ ...p, datasets }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLap, selectedHorse]);

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

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
        box.className = "inline-block w-20 h-3 mr-2 rounded";
        box.style.background = ds.backgroundColor;
        const text = document.createElement("span");
        text.textContent = ds.label;
        li.appendChild(box);
        li.appendChild(text);
        ul.appendChild(li);
      });
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !isSmallScreen,
        position: isSmallScreen ? "top" : legendPosition,
      },
    },
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
        pointLabels: {
          padding: 5,
          font: {
            size: 12,
            weight: "bold",
          },
          color: "#000",
        },
        ticks: {
          display: false, //temp gömmer 10, 20, 30 40, etc. 
          // color: "#000",
          // font: {
          //   size: 12,
          //   weight: "bold"
          // },
          // z: 1
        },
      },
    },
    elements: { line: { borderWidth: 2 } },
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const yesterdayStr = new Date(today - 864e5).toISOString().split("T")[0];
  const tomorrowStr = new Date(+today + 864e5).toISOString().split("T")[0];
  const fmt = (d) => {
    const date = new Date(d);
    const weekday = date.toLocaleDateString("sv-SE", { weekday: "long" });
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const rest = date.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
    });
    return `${capitalizedWeekday}, ${rest}`;
  };

  const selectedDateLabel =
    selectedDate === todayStr
      ? `Idag, ${fmt(selectedDate)}`
      : selectedDate === yesterdayStr
      ? `Igår, ${fmt(selectedDate)}`
      : selectedDate === tomorrowStr
      ? `Imorgon, ${fmt(selectedDate)}`
      : fmt(selectedDate);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack || "Färjestad";
  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition || "v75";
  const selectedLapLabel =
    laps.find((l) => l.id === +selectedLap)?.nameOfLap || "Lopp 1";

  const handleDate = (e) => setSelectedDate(e.target.value);
  const handleTrack = (e) => setSelectedTrack(e.target.value);
  const handleComp = (e) => setSelectedCompetition(e.target.value);
  const handleLap = (e) => setSelectedLap(e.target.value);

  return (
    <div className="flex flex-col justify-center items-center mt-1 px-2 pb-10">
      {/*  <p className="sm:text-xl text-lg font-semibold text-slate-700 mt-4 mb-4 sm:mt-2 sm:mb-2 px-4 py-2 flex flex-col justify-center items-center bg-slate-100 rounded-xl border">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p> */}

      <div className="sm:w-[80vh] w-full sm:h-[50vh] h-[35vh] relative flex items-center justify-center">
        {data.datasets.length > 0 && !loading && (
          <Radar data={data} options={options} plugins={[htmlLegendPlugin]} />
        )}

        {!loading && data.datasets.length === 0 && (
          <div className="text-sm text-slate-500">
            No data found for this lap.
          </div>
        )}

        {showSpinner && loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      <div className="mt-0 self-start flex flex-wrap">
        <ul
          ref={legendRef}
          className={
            isSmallScreen
              ? "relative z-10 grid grid-cols-1 gap-2 text-xs"
              : "hidden"
          }
        />
      </div>
        <div className="flex flex-col w-full sm:w-auto space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 bg-slate-50 sm:p-4 rounded-xl border shadow-md mt-0 sm:mt-8">
        <select value={selectedDate} onChange={handleDate} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj datum</option>
          {dates.map(d => <option key={d.date} value={d.date}>{d.date}</option>)}
        </select>

        <select value={selectedTrack} onChange={handleTrack} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj bana</option>
          {tracks.map(t => <option key={t.id} value={t.id}>{t.nameOfTrack}</option>)}
        </select>

        <select value={selectedCompetition} onChange={handleComp} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj spelform</option>
          {competitions.map(c => <option key={c.id} value={c.id}>{c.nameOfCompetition}</option>)}
        </select>

        <select value={selectedLap} onChange={handleLap} className="w-full sm:w-auto p-2 border rounded-lg hover:bg-slate-50">
          <option value="" disabled>Välj lopp</option>
          {laps.map(l => <option key={l.id} value={l.id}>{l.nameOfLap}</option>)}
        </select>
      </div> 
      {error && <div className="text-red-600 mt-4">Error: {error}</div>}
    </div>
  );
};

export default SpiderChart;
