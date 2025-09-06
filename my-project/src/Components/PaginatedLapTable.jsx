import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";

const PaginatedLapTable = ({
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

  startsCount,           
  setStartsCount,      
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [localStartsCount, setLocalStartsCount] = useState(4); 
  const activeStartsCount = startsCount ?? localStartsCount;   
  const setActiveStartsCount = setStartsCount ?? setLocalStartsCount; 

  const [lapData, setLapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "analys", direction: "desc" }); //Changed!

  const [availableCounts, setAvailableCounts] = useState([]); 
  const [availLoading, setAvailLoading] = useState(false);

  const competitionName =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ?? "Analys";

  const maxAnalysValue = useMemo(
    () => Math.max(...lapData.map((r) => Number(r.analys) || -Infinity)),
    [lapData]
  );

  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return;
    const ac = new AbortController();
    setAvailLoading(true);

    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/starts/available?lapId=${selectedLap}`, { signal: ac.signal });
        if (!r.ok) throw new Error(r.statusText);
        const counts = await r.json(); 
        setAvailableCounts(counts);
        if (counts.length && !counts.includes(activeStartsCount)) {
          setActiveStartsCount(counts[0]); 
        }
      } catch {

      } finally {
        if (!ac.signal.aborted) setAvailLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, API_BASE_URL]);


  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error(res.statusText);
        const horses = await res.json();

        const rows = await Promise.all(
          horses.map(async (h, idx) => {
            try {
              const fsRes = await fetch(
                `${API_BASE_URL}/starts/findData?completeHorseId=${h.id}&starter=${activeStartsCount}`,
                { signal: ac.signal }
              );
              const fs = fsRes.ok ? await fsRes.json() : {};
              return {
                ...h,
                ...{
                  analys: Number(fs?.analys ?? 0),     //Changed!
                  fart: Number(fs?.fart ?? 0),         //Changed!
                  styrka: Number(fs?.styrka ?? 0),     //Changed!
                  klass: Number(fs?.klass ?? 0),       //Changed!
                  prispengar: Number(fs?.prispengar ?? 0), //Changed!
                  kusk: Number(fs?.kusk ?? 0),         //Changed!
                  placering: Number(fs?.placering ?? 0), //Changed!
                  form: Number(fs?.form ?? 0),         //Changed!
                },
                position: idx + 1,
              };
            } catch {
              return {
                ...h,
                analys: 0, fart: 0, styrka: 0, klass: 0, prispengar: 0, kusk: 0, placering: 0, form: 0,
                position: idx + 1,
              };
            }
          })
        );

        if (!ac.signal.aborted) {
          setLapData(rows);
          setSortConfig({ key: "analys", direction: "desc" }); //Changed!
        }
      } catch (e) {
        if (ac.signal.aborted) return;
        setError("Failed to fetch lap data.");
        setLapData([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, activeStartsCount, API_BASE_URL]); 


  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedLapData = [...lapData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal === undefined || bVal === undefined) return 0;

    // Säkerställ numerisk sortering för tal – inte strängjämförelse //Changed!
    const numKeys = new Set(["analys","fart","styrka","klass","prispengar","kusk","placering","form"]); //Changed!
    const av = numKeys.has(sortConfig.key) ? Number(aVal) : (typeof aVal === "string" ? aVal.toLowerCase() : aVal); //Changed!
    const bv = numKeys.has(sortConfig.key) ? Number(bVal) : (typeof bVal === "string" ? bVal.toLowerCase() : bVal); //Changed!

    if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
    if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });


  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () => idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () => idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);


  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
  const sv = (d) => {
    const date = new Date(d);
    const weekday = date.toLocaleDateString("sv-SE", { weekday: "long" });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const rest = date.toLocaleDateString("sv-SE", { day: "numeric", month: "long" });
    return `${capitalizedWeekday}, ${rest}`;
  };
  const selectedDateLabel =
    selectedDate === today ? `Idag, ${sv(selectedDate)}` :
    selectedDate === yesterday ? `Igår, ${sv(selectedDate)}` :
    selectedDate === tomorrow ? `Imorgon, ${sv(selectedDate)}` : sv(selectedDate);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "";
  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ?? "";

  const compName =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ?? "";

  const lapPrefix = /proposition/i.test(compName) ? "Prop"
    : /^(vinnare|plats)$/i.test(compName.trim()) ? "Lopp" : "Avd";

  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      <p className="sm:text-xl text-lg font-semibold text-slate-800 mt-0 mb-4 sm:mt-0 sm:mb-2 px-4 py-1 flex flex-col justify-center items-center">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p>

      {/* Date selector */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goPrev} disabled={idx <= 0 || loading} className="p-1 text-4xl md:text-5xl disabled:opacity-40">
          &#8592;
        </button>

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          min={dates[0]?.date}
          max={dates[dates.length - 1]?.date}
          availableDates={dates.map((d) => d.date)}
        />

        <button onClick={goNext} disabled={idx >= dates.length - 1 || loading} className="p-1 text-4xl md:text-5xl disabled:opacity-40">
          &#8594;
        </button>
      </div>

      {/* Track buttons */}
      <div className="flex flex-wrap gap-1 mb-2">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              t.id === +selectedTrack ? "bg-emerald-500 text-white font-semibold shadow" : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {t.nameOfTrack}
          </button>
        ))}
      </div>

      {/* Competition buttons */}
      <div className="flex flex-wrap gap-1 mb-2">
        {competitions.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompetition(c.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              c.id === +selectedCompetition ? "bg-teal-600 text-white font-semibold shadow" : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {c.nameOfCompetition}
          </button>
        ))}
      </div>

      {/* Lap buttons */}
      <div className="flex flex-wrap gap-1 mb-2">
        {laps.map((lap) => (
          <button
            key={lap.id}
            onClick={() => setSelectedLap(lap.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              lap.id === +selectedLap ? "bg-indigo-500 text-white font-semibold shadow" : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {`${lapPrefix} ${lap.nameOfLap}`}
          </button>
        ))}
      </div>

      <div className="self-start flex gap-1 mb-4 items-start min-h-[40px] flex-wrap">
        {!availLoading && availableCounts.map((n) => ( 
          <button
            key={n}
            onClick={() => setActiveStartsCount(n)} 
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              activeStartsCount === n
                ? "bg-blue-500 hover:bg-blue-700 text-white font-semibold shadow focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {n} starter
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/70">
            <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-indigo-500 rounded-full" />
          </div>
        )}

        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th onClick={() => requestSort("numberOfCompleteHorse")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">#</th>
              <th onClick={() => requestSort("nameOfCompleteHorse")} className="py-2 px-2 font-semibold cursor-pointer text-left border-r last:border-r-0 border-gray-300">Häst</th>
              <th onClick={() => requestSort("analys")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300 bg-orange-100">{competitionName}</th>
              <th onClick={() => requestSort("styrka")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Prestation</th>
              <th onClick={() => requestSort("placering")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Placering</th>
              <th onClick={() => requestSort("fart")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Fart</th>
              <th onClick={() => requestSort("form")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Form</th>
              <th onClick={() => requestSort("klass")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Motstånd</th>
              <th onClick={() => requestSort("prispengar")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Klass</th>
              <th onClick={() => requestSort("kusk")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Skrik</th>
            </tr>
          </thead>

          <tbody>
            {sortedLapData.map((row) => {
              const isMax = Number(row.analys) === maxAnalysValue;
              return (
                <tr key={row.id} className="border-b last:border-b-0 border-gray-200 hover:bg-blue-50 even:bg-gray-50">
                  <td className="border-r border-blue-200 px-1">
                    <span className="inline-block border border-indigo-700 px-2 py-0.5 rounded-md text-sm font-medium bg-indigo-100 shadow-sm">
                      {row.numberOfCompleteHorse}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-left border-r border-gray-200">{row.nameOfCompleteHorse}</td>
                  <td className={`py-2 px-2 border-r border-gray-200 ${isMax ? "bg-orange-300 font-bold underline" : "bg-orange-50"}`}>
                    {row.analys}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">{row.styrka}</td>
                  <td className="py-2 px-2 border-r border-gray-200">{row.placering}</td>
                  <td className="py-2 px-2 border-r border-gray-200">{row.fart}</td>
                  <td className="py-2 px-2 border-r border-gray-200">{row.form}</td>
                  <td className="py-2 px-2 border-r border-gray-200">{row.klass}</td>
                  <td className="py-2 px-2 border-r border-gray-200">{row.prispengar}</td>
                  <td className="py-2 px-2 border-r border-gray-200">{row.kusk}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
};

export default PaginatedLapTable;
