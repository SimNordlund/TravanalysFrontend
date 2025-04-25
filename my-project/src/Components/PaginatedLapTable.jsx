import React, { useEffect, useState } from "react";

const PaginatedLapTable = () => {
  /* ─── state ─────────────────────────────────────────────── */
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [competitionName, setCompetitionName] = useState("");

  const [laps, setLaps] = useState([]);
  const [selectedLap, setSelectedLap] = useState(null);

  const [lapData, setLapData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* ─── 0. dates (default = i dag or latest) ──────────────── */
  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((r) => r.json())
      .then((all) => {
        if (!all.length) return;
        setDates(all);
        const todayStr = new Date().toISOString().split("T")[0];
        const todayObj = all.find((d) => d.date === todayStr);
        setSelectedDate(todayObj ? todayObj.date : all[all.length - 1].date);
      })
      .catch(() => setError("Kunde inte hämta datum."));
  }, []);

  /* ─── 1. tracks for selected date ───────────────────────── */
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
        if (t.length) setSelectedTrack(t[0].id);
        else {
          setTracks([]);
          setCompetitions([]);
          setLaps([]);
        }
      } catch {
        setError("Fel vid hämtning av bana.");
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [selectedDate]);

  /* ─── 2. competitions for track ─────────────────────────── */
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
        if (comps.length) {
          setSelectedCompetition(comps[0].id);
          setCompetitionName(comps[0].nameOfCompetition);
        } else {
          setCompetitions([]);
          setLaps([]);
        }
      } catch {
        setError("Fel vid hämtning av spelform.");
      } finally {
        setLoading(false);
      }
    };
    fetchComps();
  }, [selectedTrack]);

  /* ─── 3. laps for competition ───────────────────────────── */
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
        if (lapsJSON.length) setSelectedLap(lapsJSON[0].id);
        else setLaps([]);
      } catch {
        setError("Fel vid hämtning av lopp.");
      } finally {
        setLoading(false);
      }
    };
    fetchLaps();
  }, [selectedCompetition]);

  /* ─── 4. horses + four-starts for lap (NEW logic) ───────── */ //Changed!
  useEffect(() => {
    if (!selectedLap) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        /* A. complete horses for the lap */
        const res = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}` //Changed!
        );
        const horses = await res.json();

        /* B. for each horse fetch four-starts block (analys, fart, …) */
        const rows = await Promise.all(
          horses.map(async (h) => {
            const fsRes = await fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${h.id}` //Changed!
            );
            const fs = await fsRes.json();
            return {
              ...h,           // ← keep any existing fields (trend, vOdds, etc)
              ...fs,          // ← adds analys, fart, styrka, klass, prispengar, kusk
            };
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

  /* ─── arrow helpers ─────────────────────────────────────── */
  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () =>
    idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () =>
    idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);

  /* ─── Swedish nice date (Idag / Igår / Imorgon) ─────────── */
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 864e5)
    .toISOString()
    .split("T")[0];
  const tomorrow = new Date(Date.now() + 864e5)
    .toISOString()
    .split("T")[0];
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

  /* ─── JSX ───────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      {/* 1. arrows + date */}
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

      {/* 2. track pills */}
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

      {/* 3. competition pills */}
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

      {/* 4. lap pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {laps.map((lap) => (
          <button
            key={lap.id}
            onClick={() => setSelectedLap(lap.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              lap.id === selectedLap
                ? "bg-indigo-500 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {lap.nameOfLap}
          </button>
        ))}
      </div>

      {/* 5. data table */}
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
              <th className="py-2 px-2 font-semibold">Häst / Kusk</th>
              <th className="py-2 px-2 font-semibold">
                {competitionName || "Procent"}%
              </th>
              <th className="py-2 px-2 font-semibold">Trend %</th>
              <th className="py-2 px-2 font-semibold">V-Odds</th>
              <th className="py-2 px-2 font-semibold">Tränare</th>
              <th className="py-2 px-2 font-semibold">Tips</th>
              <th className="py-2 px-2 font-semibold">Skor</th>
              <th className="py-2 px-2 font-semibold">Vagn</th>
            </tr>
          </thead>
          <tbody>
            {lapData.map((row, i) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0 border-gray-200 hover:bg-gray-50"
              >
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2">{row.nameOfCompleteHorse}</td>
                <td className="py-2 px-2">{row.analys}</td>      {/* from fourStarts */}
                <td className="py-2 px-2">{row.fart}</td>        
                <td className="py-2 px-2">{row.styrka}</td>      
                <td className="py-2 px-2">{row.klass}</td>       
                <td className="py-2 px-2">{row.prispengar}</td>  
                <td className="py-2 px-2">{"C C"}</td>
                <td className="py-2 px-2">Gungig</td>        
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
