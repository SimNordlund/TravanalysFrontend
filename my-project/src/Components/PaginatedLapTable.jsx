import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { ChevronLeft, ChevronRight } from "lucide-react"; //Changed! (tog bort Weight som inte används)

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

  const normalizeStarter = (v) => String(v ?? "").trim() || "0"; //Changed!

  //Changed! localStartsCount som string istället för number
  const [localStartsCount, setLocalStartsCount] = useState("0"); //Changed!
  const activeStartsCount = normalizeStarter(startsCount ?? localStartsCount); //Changed!
  const setActiveStartsCount = setStartsCount ?? setLocalStartsCount;

  const [lapData, setLapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "analys",
    direction: "desc",
  });

  const [availableCounts, setAvailableCounts] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  //Changed! tog bort "start/starter" hårdkodat
  const starterLabel = (starter) => { //Changed!
    const s = normalizeStarter(starter); //Changed!
    if (s === "0") return "Analys"; //Changed!
    return s; //Changed!
  };

  const competitionName =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ??
    "Analys";

  const maxAnalysValue = useMemo(
    () => Math.max(...lapData.map((r) => Number(r.analys) || -Infinity)),
    [lapData]
  );

  // Hämta tillgängliga starters (som strings)
  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return;
    const ac = new AbortController();
    setAvailLoading(true);

    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/starts/available?lapId=${selectedLap}`,
          { signal: ac.signal }
        );
        if (!r.ok) throw new Error(r.statusText);

        const countsRaw = await r.json(); //Changed!
        const counts = (Array.isArray(countsRaw) ? countsRaw : [])
          .map((c) => normalizeStarter(c)); //Changed!

        setAvailableCounts(counts); //Changed!

        const current = normalizeStarter(activeStartsCount); //Changed!
        if (counts.length && !counts.includes(current)) { //Changed!
          setActiveStartsCount(counts[0]); //Changed!
        }
      } catch {
      } finally {
        if (!ac.signal.aborted) setAvailLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, API_BASE_URL, activeStartsCount, setActiveStartsCount]); //Changed!

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

        const starterParam = encodeURIComponent(normalizeStarter(activeStartsCount)); //Changed!

        const rows = await Promise.all(
          horses.map(async (h, idx) => {
            try {
              const fsRes = await fetch(
                `${API_BASE_URL}/starts/findData?completeHorseId=${h.id}&starter=${starterParam}`, //Changed!
                { signal: ac.signal }
              );
              const fs = fsRes.ok ? await fsRes.json() : {};
              return {
                ...h,
                ...{
                  analys: Number(fs?.analys ?? 0),
                  fart: Number(fs?.fart ?? 0),
                  styrka: Number(fs?.styrka ?? 0),
                  klass: Number(fs?.klass ?? 0),
                  prispengar: Number(fs?.prispengar ?? 0),
                  kusk: Number(fs?.kusk ?? 0),
                  placering: Number(fs?.placering ?? 0),
                  form: Number(fs?.form ?? 0),
                },
                position: idx + 1,
              };
            } catch {
              return {
                ...h,
                analys: 0,
                fart: 0,
                styrka: 0,
                klass: 0,
                prispengar: 0,
                kusk: 0,
                placering: 0,
                form: 0,
                position: idx + 1,
              };
            }
          })
        );

        if (!ac.signal.aborted) {
          setLapData(rows);
          setSortConfig({ key: "analys", direction: "desc" });
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
  }, [selectedLap, activeStartsCount, API_BASE_URL]); //Changed!

  // Sortering på tabeller.
  const firstDirForKey = (key) => {
    const ascFirst = new Set(["nameOfCompleteHorse", "numberOfCompleteHorse"]);
    return ascFirst.has(key) ? "asc" : "desc";
  };

  const requestSort = (key) => {
    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: firstDirForKey(key) });
    } else {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    }
  };

  const sortedLapData = [...lapData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal === undefined || bVal === undefined) return 0;

    const numKeys = new Set([
      "analys",
      "fart",
      "styrka",
      "klass",
      "prispengar",
      "kusk",
      "placering",
      "form",
      "numberOfCompleteHorse",
    ]);

    const av = numKeys.has(sortConfig.key)
      ? Number(aVal)
      : typeof aVal === "string"
      ? aVal.toLowerCase()
      : aVal;

    const bv = numKeys.has(sortConfig.key)
      ? Number(bVal)
      : typeof bVal === "string"
      ? bVal.toLowerCase()
      : bVal;

    if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
    if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () => idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () =>
    idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];

  const sv = (d) => {
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
    selectedDate === today
      ? `Idag, ${sv(selectedDate)}`
      : selectedDate === yesterday
      ? `Igår, ${sv(selectedDate)}`
      : selectedDate === tomorrow
      ? `Imorgon, ${sv(selectedDate)}`
      : sv(selectedDate);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "";
  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ??
    "";

  const compName =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ??
    "";

  const lapPrefix = /proposition/i.test(compName)
    ? "Prop"
    : /^(vinnare|plats)$/i.test(compName.trim())
    ? "Lopp"
    : "Avd";

  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      <p className="sm:text-xl text-lg font-semibold text-slate-800 mt-0 mb-4 sm:mt-0 sm:mb-5 px-4 py-1 flex flex-col justify-center items-center">
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}
      </p>

      <div className="flex items-center justify-between sm:justify-self-center mb-4">
        <button
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          className="mb-1 mr-6 sm:mr-8 inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 [stroke-width:3]" />
        </button>

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          min={dates[0]?.date}
          max={dates[dates.length - 1]?.date}
          availableDates={dates.map((d) => d.date)}
        />

        <button
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          className="mb-1 ml-6 sm:ml-8 inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 [stroke-width:3]" />
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
              t.id === +selectedTrack
                ? "bg-emerald-500 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
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
              c.id === +selectedCompetition
                ? "bg-teal-600 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
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
              lap.id === +selectedLap
                ? "bg-indigo-500 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            }`}
          >
            {`${lapPrefix} ${lap.nameOfLap}`}
          </button>
        ))}
      </div>

      <div className="self-start flex gap-1 mb-4 items-start min-h-[40px] flex-wrap">
        {!availLoading &&
          availableCounts.map((n) => (
            <button
              key={String(n)} //Changed!
              onClick={() => setActiveStartsCount(normalizeStarter(n))} //Changed!
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                normalizeStarter(activeStartsCount) === normalizeStarter(n) //Changed!
                  ? "bg-blue-500 hover:bg-blue-700 text-white font-semibold shadow focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {starterLabel(n)}
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
              <th
                onClick={() => requestSort("numberOfCompleteHorse")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                #
              </th>
              <th
                onClick={() => requestSort("nameOfCompleteHorse")}
                className="py-2 px-2 font-semibold cursor-pointer text-left border-r last:border-r-0 border-gray-300"
              >
                Häst
              </th>
              <th
                onClick={() => requestSort("analys")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300 bg-orange-100"
              >
                {competitionName}
              </th>
              <th
                onClick={() => requestSort("styrka")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Prestation
              </th>
              <th
                onClick={() => requestSort("placering")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Placering
              </th>
              <th
                onClick={() => requestSort("fart")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Fart
              </th>
              <th
                onClick={() => requestSort("form")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Form
              </th>
              <th
                onClick={() => requestSort("klass")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Motstånd
              </th>
              <th
                onClick={() => requestSort("prispengar")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Klass
              </th>
              <th
                onClick={() => requestSort("kusk")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Skrik
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedLapData.map((row) => {
              const isMax = Number(row.analys) === maxAnalysValue;
              return (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 border-gray-200 hover:bg-blue-50 even:bg-gray-50"
                >
                  <td className="border-r border-blue-200 px-1">
                    <span className="inline-block border border-indigo-700 px-2 py-0.5 rounded-md text-sm font-medium bg-indigo-100 shadow-sm">
                      {row.numberOfCompleteHorse}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-left border-r border-gray-200">
                    {row.nameOfCompleteHorse}
                  </td>
                  <td
                    className={`py-2 px-2 border-r border-gray-200 ${
                      isMax
                        ? "bg-orange-300 font-bold underline"
                        : "bg-orange-50"
                    }`}
                  >
                    {row.analys}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.styrka}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.placering}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.fart}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.form}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.klass}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.prispengar}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.kusk}
                  </td>
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
