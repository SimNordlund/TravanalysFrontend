import React, { useState, useEffect, useRef } from "react";
import { Radar } from "react-chartjs-2";
import Chart from "chart.js/auto";

// ▶ SpiderChart – auto-selects the first available date → track → competition → lap
//   so a radar diagram is shown immediately on first render.

const SpiderChart = ({
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
}) => {
  const [data, setData] = useState({
    labels: ["Analys", "Fart", "Styrka", "Klass", "Prispengar", "Kusk"],
    datasets: [],
  });

  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);

  /* ---- Legend responsiveness (same approach as BarChart) ---- */
  const legendRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---- OPTIONAL: keep “right” legend on larger viewports ---- */
  const getLegendPosition = () => (window.innerWidth >= 640 ? "right" : "top");
  const [legendPosition, setLegendPosition] = useState(getLegendPosition());

  useEffect(() => {
    const handleResize = () => setLegendPosition(getLegendPosition());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---- REST -- API base url ---- */
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* ────────────────────────────────
     1. Dates → auto-pick first date
  ──────────────────────────────── */
  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((res) => res.json())
      .then((data) => {
        setDates(data);
        if (!selectedDate) {
          // Only set if NOT already chosen
          const todayStr = new Date().toISOString().split("T")[0];
          const todayDate = data.find((d) => d.date === todayStr);
          if (todayDate) setSelectedDate(todayDate.date);
          else if (data.length) setSelectedDate(data[0].date);
        }
      })
      .catch((err) => console.error("Error fetching dates:", err));
  }, []);

  /* ────────────────────────────────
     2. Tracks → auto-pick first track
  ──────────────────────────────── */
  useEffect(() => {
    if (!selectedDate) return;
    fetch(`${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setTracks(data);
        if (data.length) setSelectedTrack(data[0].id);
      })
      .catch((err) => console.error("Error fetching tracks:", err));
  }, [selectedDate]);

  /* ────────────────────────────────
     3. Competitions → auto-pick first competition
  ──────────────────────────────── */
  useEffect(() => {
    if (!selectedTrack) return;
    fetch(`${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`)
      .then((res) => res.json())
      .then((data) => {
        setCompetitions(data);
        if (data.length) setSelectedCompetition(data[0].id);
      })
      .catch((err) => console.error("Error fetching competitions:", err));
  }, [selectedTrack]);

  /* ────────────────────────────────
     4. Laps → auto-pick first lap
  ──────────────────────────────── */
  useEffect(() => {
    if (!selectedCompetition) return;

    fetch(
      `${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`
    )
      .then((res) => res.json())
      .then((data) => {
        setLaps(data);

        // Only auto-select first lap if none is selected or it's not in the new list
        const lapExists = data.some((lap) => lap.id === +selectedLap);
        if (!selectedLap || !lapExists) {
          if (data.length > 0) setSelectedLap(data[0].id); //Changed!
        }
      })
      .catch((err) => {
        console.error("Error fetching laps:", err);
        setLaps([]);
      });
  }, [selectedCompetition]); //Changed!

  /* ────────────────────────────────
     5. Fetch horse & four-starts data
  ──────────────────────────────── */
  useEffect(() => {
    if (!selectedLap) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`)
      .then((res) => {
        if (!res.ok) throw new Error("Horse fetch failed: " + res.statusText);
        return res.json();
      })
      .then((completeHorses) =>
        Promise.all(
          completeHorses.map((horse, idx) =>
            fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`
            )
              .then((res) => {
                if (!res.ok)
                  throw new Error(
                    "Four-starts fetch failed: " + res.statusText
                  );
                return res.json();
              })
              .then((fs) => ({
                label: `${idx + 1}. ${horse.nameOfCompleteHorse}`,
                data: [
                  fs.analys,
                  fs.fart,
                  fs.styrka,
                  fs.klass,
                  fs.prispengar,
                  fs.kusk,
                ],
                backgroundColor: `rgba(${Math.random() * 255}, ${
                  Math.random() * 255
                }, ${Math.random() * 255}, 0.5)`,
              }))
          )
        )
      )
      .then((radarData) => {
        setData((prev) => ({ ...prev, datasets: radarData }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLap]);

  /* ───── Delay spinner by 3 s ───── */
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowSpinner(true), 3000);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  /* ────────────────────────────────
     Custom HTML legend - same logic as BarChart
  ──────────────────────────────── */
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

  /* ────────────────────────────────
     Options (hide default legend on mobile)
  ──────────────────────────────── */
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
      r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 100 },
    },
    elements: { line: { borderWidth: 3 } },
  };

  /* ────────────────────────────────
     Helpers to derive nice Swedish labels
  ──────────────────────────────── */
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const formatDateInSwedish = (d) =>
    new Date(d).toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const selectedDateLabel =
    selectedDate === todayStr
      ? `Idag, ${formatDateInSwedish(selectedDate)}`
      : selectedDate === yesterdayStr
      ? `Igår, ${formatDateInSwedish(selectedDate)}`
      : selectedDate === tomorrowStr
      ? `Imorgon, ${formatDateInSwedish(selectedDate)}`
      : formatDateInSwedish(selectedDate);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "Färjestad";
  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "v75";
  const selectedLapLabel =
    laps.find((l) => l.id === +selectedLap)?.nameOfLap ?? "Lopp 1";

  /* ────────────────────────────────
     Handlers
  ──────────────────────────────── */
  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const handleTrackChange = (e) => setSelectedTrack(e.target.value);
  const handleCompetitionChange = (e) => setSelectedCompetition(e.target.value);
  const handleLapChange = (e) => setSelectedLap(e.target.value);

  /* ────────────────────────────────
     JSX
  ──────────────────────────────── */
  return (
    <div className="flex flex-col justify-center items-center mt-1 px-2 pb-10">
      <p className="sm:text-xl text-lg font-semibold text-slate-700 mt-4 mb-4 sm:mt-2 sm:mb-2 px-4 py-2 flex flex-col justify-center items-center bg-slate-100">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p>

      {/* Custom legend (only visible <640 px) */}
      <ul
        ref={legendRef}
        className={`${
          isSmallScreen ? "grid grid-cols-3 gap-x-2 gap-y-1 text-xs" : "hidden"
        }`}
      />

      {/* Radar Chart / placeholder / spinner */}
      <div className="relative w-full sm:w-[300px] md:w-[500px] h-[40vh] sm:h-[40vh] md:h-[50vh] flex items-center justify-center">
        {data.datasets.length > 0 && !loading && (
          <Radar
            data={data}
            options={options}
            plugins={isSmallScreen ? [htmlLegendPlugin] : []}
          />
        )}

        {!loading && data.datasets.length === 0 && (
          <div className="text-sm text-slate-500">
            No data found for this lap.
          </div>
        )}

        {showSpinner &&
          loading && ( //Changed!
            <div className="flex flex-col items-center">
              <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />{" "}
              {/* use your own image if you prefer */}
              <span className="mt-2 text-sm text-slate-500">Grubblar…</span>
            </div>
          )}
      </div>

      {/* Dropdowns */}
      <div className="flex flex-col w-full sm:w-auto space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 bg-slate-50 sm:p-4 rounded-xl border shadow-md mt-4 sm:mt-8">
        <select
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg"
        >
          <option value="" disabled>
            Välj datum
          </option>
          {dates.map((d) => (
            <option key={d.id} value={d.date}>
              {d.date}
            </option>
          ))}
        </select>

        <select
          value={selectedTrack}
          onChange={handleTrackChange}
          className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg"
        >
          <option value="" disabled>
            Välj bana
          </option>
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameOfTrack}
            </option>
          ))}
        </select>

        <select
          value={selectedCompetition}
          onChange={handleCompetitionChange}
          className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg"
        >
          <option value="" disabled>
            Välj spelform
          </option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameOfCompetition}
            </option>
          ))}
        </select>

        <select
          value={selectedLap}
          onChange={handleLapChange}
          className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg"
        >
          <option value="" disabled>
            Välj lopp
          </option>
          {laps.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nameOfLap}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-600 mt-4">Error: {error}</div>}
    </div>
  );
};

export default SpiderChart;
