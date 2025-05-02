import React, { useEffect, useState } from "react";

const PaginatedLapTable = ({
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
}) => {
  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);
  const [lapData, setLapData] = useState([]);
  const [competitionName, setCompetitionName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); //Changed!

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((r) => r.json())
      .then((all) => {
        if (!all.length) return;
        setDates(all);
        if (!selectedDate) {
          const todayStr = new Date().toISOString().split("T")[0];
          const todayObj = all.find((d) => d.date === todayStr);
          setSelectedDate(todayObj ? todayObj.date : all[all.length - 1].date); //Changed!
        }
      })
      .catch(() => setError("Kunde inte hämta datum."));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`
        );
        const t = await res.json();
        setTracks(t);

        const exists = t.find((track) => track.id === +selectedTrack);
        if (!selectedTrack || !exists) {
          if (t.length) setSelectedTrack(t[0].id); //Changed!
        }
      } catch {
        setError("Fel vid hämtning av bana.");
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedTrack) return;
    const fetchComps = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`
        );
        const comps = await res.json();
        setCompetitions(comps);

        const exists = comps.find((c) => c.id === +selectedCompetition);
        if (!selectedCompetition || !exists) {
          if (comps.length) {
            setSelectedCompetition(comps[0].id); //Changed!
            setCompetitionName(comps[0].nameOfCompetition);
          }
        }
      } catch {
        setError("Fel vid hämtning av spelform.");
      } finally {
        setLoading(false);
      }
    };
    fetchComps();
  }, [selectedTrack]);

  useEffect(() => {
    if (!selectedCompetition) return;
    const fetchLaps = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`
        );
        const lapsJSON = await res.json();
        setLaps(lapsJSON);

        const exists = lapsJSON.find((l) => l.id === +selectedLap);
        if (!selectedLap || !exists) {
          if (lapsJSON.length) setSelectedLap(lapsJSON[0].id); //Changed!
        }
      } catch {
        setError("Fel vid hämtning av lopp.");
      } finally {
        setLoading(false);
      }
    };
    fetchLaps();
  }, [selectedCompetition]);

  useEffect(() => {
    if (!selectedLap) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`
        ); //Changed!
        const horses = await res.json();

        const rows = await Promise.all(
          horses.map(async (h) => {
            const fsRes = await fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${h.id}` //Changed!
            );
            const fs = await fsRes.json();
            return { ...h, ...fs };
          })
        );
        setLapData(rows);
      } catch {
        setError("Failed to fetch lap data.");
        setLapData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLap]);

  const requestSort = (key) => { //Changed!
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedLapData = [...lapData].sort((a, b) => { //Changed!
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal === undefined || bVal === undefined) return 0;
    const aStr = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
    const bStr = typeof bVal === "string" ? bVal.toLowerCase() : bVal;
    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () => idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () =>
    idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
  const sv = (d) =>
    new Date(d).toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  const niceDate =
    selectedDate === today
      ? `Idag, ${sv(selectedDate)}`
      : selectedDate === yesterday
      ? `Igår, ${sv(selectedDate)}`
      : selectedDate === tomorrow
      ? `Imorgon, ${sv(selectedDate)}`
      : sv(selectedDate);

  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8592;
        </button>

        <h2 className="text-center text-lg sm:text-2xl font-semibold">
          {niceDate}
        </h2>

        <button
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8594;
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              t.id === selectedTrack
                ? "bg-emerald-500 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {t.nameOfTrack}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {competitions.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCompetition(c.id);
              setCompetitionName(c.nameOfCompetition);
            }}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              c.id === selectedCompetition
                ? "bg-teal-600 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {c.nameOfCompetition}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {laps.map((lap) => (
          <button
            key={lap.id}
            onClick={() => setSelectedLap(lap.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              lap.id === +selectedLap
                ? "bg-indigo-500 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {lap.nameOfLap}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75">
            <div className="loader rounded-full border-4 border-t-4 border-gray-200 h-10 w-10" />
          </div>
        )}

        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="py-2 px-2 font-semibold">#</th>
              <th className="py-2 px-2 font-semibold cursor-pointer" onClick={() => requestSort("nameOfCompleteHorse")}>Häst</th> {/* Changed! */}
              <th className="py-2 px-2 font-semibold cursor-pointer" onClick={() => requestSort("analys")}>{competitionName || "Procent"}%</th> {/* Changed! */}
              <th className="py-2 px-2 font-semibold cursor-pointer" onClick={() => requestSort("fart")}>Tid</th> {/* Changed! */}
              <th className="py-2 px-2 font-semibold cursor-pointer" onClick={() => requestSort("styrka")}>Prestation</th> {/* Changed! */}
              <th className="py-2 px-2 font-semibold cursor-pointer" onClick={() => requestSort("klass")}>Motstånd</th> {/* Changed! */}
            </tr>
          </thead>
          <tbody>
            {sortedLapData.map((row, i) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0 border-gray-200 hover:bg-gray-50"
              >
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2">{row.nameOfCompleteHorse}</td>
                <td className="py-2 px-2">{row.analys}</td>
                <td className="py-2 px-2">{row.fart}</td>
                <td className="py-2 px-2">{row.styrka}</td>
                <td className="py-2 px-2">{row.klass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
};

export default PaginatedLapTable;