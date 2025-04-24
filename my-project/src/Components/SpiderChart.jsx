import React, { useState, useEffect, useRef } from "react";               //Changed!
import { Radar } from "react-chartjs-2";
import Chart from "chart.js/auto";

// ▶ SpiderChart – auto-selects the first available date → track → competition → lap
//   so a radar diagram is shown immediately on first render.

const SpiderChart = () => {
  /* ────────────────────────────────
     State & refs
  ──────────────────────────────── */
  const [data, setData] = useState({
    labels: ["Analys", "Fart", "Styrka", "Klass", "Prispengar", "Kusk"],
    datasets: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");

  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);

  /* ---- Legend responsiveness (same approach as BarChart) ---- */
  const legendRef = useRef(null);                                         //Changed!
  const [isSmallScreen, setIsSmallScreen] = useState(                     //Changed!
    window.innerWidth < 640                                               //Changed!
  );                                                                      //Changed!

  useEffect(() => {                                                       //Changed!
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);     //Changed!
    window.addEventListener("resize", onResize);                          //Changed!
    return () => window.removeEventListener("resize", onResize);          //Changed!
  }, []);                                                                 //Changed!

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
        const todayStr = new Date().toISOString().split("T")[0];
        const todayDate = data.find((d) => d.date === todayStr);
        if (todayDate) setSelectedDate(todayDate.date);                  //Changed!
        else if (data.length) setSelectedDate(data[0].date);
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
        if (data.length) setSelectedTrack(data[0].id);                  //Changed!
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
        if (data.length) setSelectedCompetition(data[0].id);            //Changed!
      })
      .catch((err) => console.error("Error fetching competitions:", err));
  }, [selectedTrack]);

  /* ────────────────────────────────
     4. Laps → auto-pick first lap
  ──────────────────────────────── */
  useEffect(() => {
    if (!selectedCompetition) return;
    fetch(`${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`)
      .then((res) => res.json())
      .then((data) => {
        setLaps(data);
        if (data.length) setSelectedLap(data[0].id);                    //Changed!
      })
      .catch((err) => {
        console.error("Error fetching laps:", err);
        setLaps([]);
      });
  }, [selectedCompetition]);

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
            fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
              .then((res) => {
                if (!res.ok) throw new Error("Four-starts fetch failed: " + res.statusText);
                return res.json();
              })
              .then((fs) => ({
                label: `${idx + 1}. ${horse.nameOfCompleteHorse}`,
                data: [fs.analys, fs.fart, fs.styrka, fs.klass, fs.prispengar, fs.kusk],
                backgroundColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`,
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

  /* ────────────────────────────────
     Custom HTML legend - same logic as BarChart
  ──────────────────────────────── */
  const htmlLegendPlugin = {                                              //Changed!
    id: "htmlLegend",                                                     //Changed!
    afterUpdate(chart) {                                                  //Changed!
      const ul = legendRef.current;                                       //Changed!
      if (!ul) return;                                                    //Changed!

      while (ul.firstChild) ul.firstChild.remove();                       //Changed!

      chart.legend.legendItems.forEach((item) => {                        //Changed!
        const li = document.createElement("li");                          //Changed!
        li.className = "flex items-center cursor-pointer";                //Changed!
        li.style.opacity = item.hidden ? 0.5 : 1;                         //Changed!

        li.onclick = () => {                                              //Changed!
          chart.toggleDataVisibility(item.datasetIndex);                  //Changed!
          chart.update();                                                 //Changed!
        };                                                                //Changed!

        const box = document.createElement("span");                       //Changed!
        box.className = "inline-block w-7 h-3 mr-2 rounded";              //Changed!
        box.style.background = item.fillStyle;                            //Changed!

        const text = document.createElement("span");                      //Changed!
        text.textContent = item.text;                                     //Changed!

        li.appendChild(box);                                              //Changed!
        li.appendChild(text);                                             //Changed!
        ul.appendChild(li);                                               //Changed!
      });                                                                 //Changed!
    },                                                                    //Changed!
  };                                                                      //Changed!

  /* ────────────────────────────────
     Options (hide default legend on mobile)
  ──────────────────────────────── */
  const options = {                                                       //Changed!
    responsive: true,                                                     //Changed!
    maintainAspectRatio: false,                                           //Changed!
    plugins: {                                                            //Changed!
      legend: {                                                           //Changed!
        display: !isSmallScreen,                                          //Changed!
        position: isSmallScreen ? "top" : legendPosition,                 //Changed!
      },                                                                  //Changed!
    },                                                                    //Changed!
    scales: { r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 100 } },
    elements: { line: { borderWidth: 3 } },
  };                                                                      //Changed!

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
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ?? "v75";
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
      <p className="sm:text-xl text-lg font-semibold text-slate-700 mt-4 mb-4 sm:mt-2 sm:mb-2 px-4 py-2 flex flex-col justify-center items-center">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
        <hr className="w-full border-t-2 border-gray-200" />
      </p>

      {/* Custom legend (only visible <640 px) */}
      <ul                                                            //Changed!
        ref={legendRef}                                              //Changed!
        className={`${                                              //Changed!
          isSmallScreen                                              //Changed!
            ? "grid grid-cols-3 gap-x-2 gap-y-1 text-xs"        //Changed!
            : "hidden"                                               //Changed!
        }`}                                                          //Changed!
      />                                                             

      {/* Radar Chart / placeholder / spinner */}
      <div className="relative w-full sm:w-[300px] md:w-[500px] h-[40vh] sm:h-[40vh] md:h-[50vh] flex items-center justify-center">
        {data.datasets.length > 0 && !loading && (
          <Radar
            data={data}
            options={options}                                         //Changed!
            plugins={isSmallScreen ? [htmlLegendPlugin] : []}        //Changed!
          />
        )}

        {!loading && data.datasets.length === 0 && (
          <div className="text-sm text-slate-500">No data found for this lap.</div>
        )}

        {loading && <div>Loading…</div>}
      </div>

      {/* Dropdowns */}
      <div className="flex flex-col w-full sm:w-auto space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 bg-slate-50 sm:p-4 rounded-xl border shadow-md sm:mt-8">
        <select value={selectedDate} onChange={handleDateChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
          <option value="" disabled>
            Välj datum
          </option>
          {dates.map((d) => (
            <option key={d.id} value={d.date}>
              {d.date}
            </option>
          ))}
        </select>

        <select value={selectedTrack} onChange={handleTrackChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
          <option value="" disabled>
            Välj bana
          </option>
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nameOfTrack}
            </option>
          ))}
        </select>

        <select value={selectedCompetition} onChange={handleCompetitionChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
          <option value="" disabled>
            Välj spelform
          </option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameOfCompetition}
            </option>
          ))}
        </select>

        <select value={selectedLap} onChange={handleLapChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
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
