import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ALL_COLUMN_KEYS = [
  "numberOfCompleteHorse",
  "nameOfCompleteHorse",
  "analys",
  "styrka",
  "placering",
  "fart",
  "form",
  "klass",
  "prispengar",
  "kusk",
];

const MOBILE_DEFAULT_COLUMN_KEYS = [
  "nameOfCompleteHorse",
  "analys",
  "styrka",
];

const getDefaultVisibleColumns = (smallScreen) =>
  smallScreen ? MOBILE_DEFAULT_COLUMN_KEYS : ALL_COLUMN_KEYS;

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

  const normalizeStarter = (v) => String(v ?? "").trim() || "0";

  const [localStartsCount, setLocalStartsCount] = useState("0");
  const activeStartsCount = normalizeStarter(startsCount ?? localStartsCount);
  const setActiveStartsCount = setStartsCount ?? setLocalStartsCount;

  const [lapData, setLapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "analys",
    direction: "desc",
  });
  const [visibleColumns, setVisibleColumns] = useState(() =>
    [...getDefaultVisibleColumns(window.innerWidth < 640)]
  );
  const [hasCustomizedColumns, setHasCustomizedColumns] = useState(false);
  const visibleColumnSet = useMemo(
    () => new Set(visibleColumns),
    [visibleColumns]
  );

  const [availableCounts, setAvailableCounts] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640); 
  useEffect(() => {
    
    const onResize = () => setIsSmallScreen(window.innerWidth < 640); 
    window.addEventListener("resize", onResize); 
    return () => window.removeEventListener("resize", onResize); 
  }, []); 

  useEffect(() => {
    if (!hasCustomizedColumns) {
      setVisibleColumns([...getDefaultVisibleColumns(isSmallScreen)]);
    }
  }, [isSmallScreen, hasCustomizedColumns]);

  const starterLabel = (starter) => {
    const s = normalizeStarter(starter);
    if (s === "0") return "Analys";
    return s;
  };

  useEffect(() => {
    if (!tracks.length || !setSelectedTrack) return; 

    const hasValidSelectedTrack = tracks.some((t) => t.id === +selectedTrack); 
    if (hasValidSelectedTrack) return; 

    const farjestadTrack = tracks.find( 
      (t) => t.nameOfTrack?.trim().toLowerCase() === "färjestad" 
    ); 

    if (farjestadTrack) { 
      setSelectedTrack(farjestadTrack.id); 
    } else if (tracks[0]) { 
      setSelectedTrack(tracks[0].id); 
    } 
  }, [tracks, selectedTrack, setSelectedTrack]); 

  useEffect(() => {
    if (!competitions.length || !setSelectedCompetition) return; 

    const hasValidSelectedCompetition = competitions.some( 
      (c) => c.id === +selectedCompetition 
    ); 
    if (hasValidSelectedCompetition) return; 

    const defaultCompetition = competitions.find( 
      (c) => c.nameOfCompetition?.trim().toLowerCase() === "v85" 
    ); 

    if (defaultCompetition) { 
      setSelectedCompetition(defaultCompetition.id); 
    } else if (competitions[0]) { 
      setSelectedCompetition(competitions[0].id); 
    } 
  }, [competitions, selectedCompetition, setSelectedCompetition]); 

  const competitionName =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "Analys";

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

        const countsRaw = await r.json();
        const counts = (Array.isArray(countsRaw) ? countsRaw : []).map((c) =>
          normalizeStarter(c)
        );

        setAvailableCounts(counts);

        const current = normalizeStarter(activeStartsCount);
        if (counts.length && !counts.includes(current)) {
          setActiveStartsCount(counts[0]);
        }
      } catch {
      } finally {
        if (!ac.signal.aborted) setAvailLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, API_BASE_URL, activeStartsCount, setActiveStartsCount]);

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

        const starterParam = encodeURIComponent(
          normalizeStarter(activeStartsCount)
        );

        const rows = await Promise.all(
          horses.map(async (h, idx) => {
            try {
              const fsRes = await fetch(
                `${API_BASE_URL}/starts/findData?completeHorseId=${h.id}&starter=${starterParam}`,
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
  }, [selectedLap, activeStartsCount, API_BASE_URL]);

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

  const today = new Date(); 
  const todayStr = today.toISOString().split("T")[0]; 
  const yesterdayStr = new Date(today - 864e5).toISOString().split("T")[0]; 
  const tomorrowStr = new Date(+today + 864e5).toISOString().split("T")[0]; 

  const fmt = (d) => { 
    if (!d) return ""; 
    const date = new Date(d); 
    if (Number.isNaN(date.getTime())) return ""; 
    const weekday = date.toLocaleDateString("sv-SE", { weekday: "long" }); 
    const capitalizedWeekday = 
      weekday.charAt(0).toUpperCase() + weekday.slice(1); 
    const rest = date.toLocaleDateString("sv-SE", { 
      day: "numeric", 
      month: "long", 
    }); 
    return `${capitalizedWeekday}, ${rest}`; 
  }; 

  const selectedDateLabel = !selectedDate 
    ? "Laddar datum…" 
    : selectedDate === todayStr 
    ? `Idag, ${fmt(selectedDate)}` 
    : selectedDate === yesterdayStr 
    ? `Igår, ${fmt(selectedDate)}` 
    : selectedDate === tomorrowStr 
    ? `Imorgon, ${fmt(selectedDate)}` 
    : fmt(selectedDate) || "Laddar datum…"; 

   const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "Färjestad"; 
  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "v85"; 

  const compName =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "v85";

  const lapPrefix = /proposition/i.test(compName)
    ? "Prop"
    : /^(vinnare|plats)$/i.test(compName.trim())
    ? "Lopp"
    : "Avd";

  const applyColumnPreset = (keys) => {
    setVisibleColumns([...keys]);
    setHasCustomizedColumns(true);
  };

  const resetVisibleColumns = () => {
    setHasCustomizedColumns(false);
    setVisibleColumns([...getDefaultVisibleColumns(isSmallScreen)]);
  };

  const toggleColumn = (key) => {
    setHasCustomizedColumns(true);
    setVisibleColumns((current) => {
      if (current.includes(key)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== key);
      }

      return ALL_COLUMN_KEYS.filter(
        (columnKey) => columnKey === key || current.includes(columnKey)
      );
    });
  };

  const columns = [
    {
      key: "numberOfCompleteHorse",
      label: "#",
      sortKey: "numberOfCompleteHorse",
      thClassName: "text-center",
      tdClassName: "px-1 text-center",
      render: (row) => (
        <span className="inline-block rounded-md border border-indigo-700 bg-indigo-100 px-2 py-0.5 text-sm font-medium shadow-sm">
          {row.numberOfCompleteHorse}
        </span>
      ),
    },
    {
      key: "nameOfCompleteHorse",
      label: "Häst",
      sortKey: "nameOfCompleteHorse",
      thClassName: "text-left",
      tdClassName: "text-left",
      render: (row) => (
        <div className="flex min-w-[10rem] items-center gap-2">
          {!visibleColumnSet.has("numberOfCompleteHorse") && (
            <span className="inline-block rounded-md border border-indigo-700 bg-indigo-100 px-2 py-0.5 text-sm font-medium shadow-sm">
              {row.numberOfCompleteHorse}
            </span>
          )}
          <span>{row.nameOfCompleteHorse}</span>
        </div>
      ),
    },
    {
      key: "analys",
      label: competitionName,
      sortKey: "analys",
      thClassName: "bg-orange-100 text-center",
      tdClassName: (row) =>
        Number(row.analys) === maxAnalysValue
          ? "bg-orange-300 font-bold underline text-center"
          : "bg-orange-50 text-center",
      render: (row) => row.analys,
    },
    {
      key: "styrka",
      label: "Prestation",
      sortKey: "styrka",
      thClassName: "text-center",
      tdClassName: "text-center",
      render: (row) => row.styrka,
    },
    {
      key: "placering",
      label: "Placering",
      sortKey: "placering",
      thClassName: "text-center",
      tdClassName: "text-center",
      render: (row) => row.placering,
    },
    {
      key: "fart",
      label: "Fart",
      sortKey: "fart",
      thClassName: "text-center",
      tdClassName: "text-center",
      render: (row) => row.fart,
    },
    {
      key: "form",
      label: "Form",
      sortKey: "form",
      thClassName: "text-center",
      tdClassName: "text-center",
      render: (row) => row.form,
    },
    {
      key: "klass",
      label: "Motstånd",
      sortKey: "klass",
      thClassName: "text-center",
      tdClassName: "text-center",
      render: (row) => row.klass,
    },
    {
      key: "prispengar",
      label: "Klass",
      sortKey: "prispengar",
      thClassName: "text-center",
      tdClassName: "text-center",
      render: (row) => row.prispengar,
    },
    {
      key: "kusk",
      label: "Skrik",
      sortKey: "kusk",
      thClassName: "text-center",
      tdClassName: "text-center",
      render: (row) => row.kusk,
    },
  ];

  const visibleTableColumns = columns.filter((column) =>
    visibleColumnSet.has(column.key)
  );

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

      <div className="flex flex-wrap gap-1 mb-2">
        {laps.map((lap) => {
          
          const lapNo = String(lap.nameOfLap ?? "").trim(); 
          const lapText = isSmallScreen
            ? `${lapPrefix}${lapNo}` 
            : `${lapPrefix} ${lapNo}`; 

          return (
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
              {lapText} {/*Changed!*/}
            </button>
          );
        })}
      </div>

      <div className="self-start flex gap-1 mb-4 items-start min-h-[40px] flex-wrap">
        {!availLoading &&
          availableCounts.map((n) => (
            <button
              key={String(n)}
              onClick={() => setActiveStartsCount(normalizeStarter(n))}
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                normalizeStarter(activeStartsCount) === normalizeStarter(n)
                  ? "bg-blue-500 hover:bg-blue-700 text-white font-semibold shadow focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {starterLabel(n)}
            </button>
          ))}
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Visa kolumner
          </span>
          <button
            type="button"
            onClick={() => applyColumnPreset(ALL_COLUMN_KEYS)}
            className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Alla
          </button>
          <button
            type="button"
            onClick={() => applyColumnPreset(MOBILE_DEFAULT_COLUMN_KEYS)}
            className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Mobil
          </button>
          <button
            type="button"
            onClick={resetVisibleColumns}
            className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Nollställ
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {columns.map((column) => {
            const active = visibleColumnSet.has(column.key);

            return (
              <button
                key={column.key}
                type="button"
                onClick={() => toggleColumn(column.key)}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {column.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/70">
            <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-indigo-500 rounded-full" />
          </div>
        )}

        <table className="w-full min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              {visibleTableColumns.map((column, columnIndex) => (
                <th
                  key={column.key}
                  onClick={() => requestSort(column.sortKey)}
                  className={`cursor-pointer py-2 px-2 font-semibold ${
                    column.thClassName
                  } ${
                    columnIndex < visibleTableColumns.length - 1
                      ? "border-r border-gray-300"
                      : ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedLapData.map((row) => {
              return (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 border-gray-200 hover:bg-blue-50 even:bg-gray-50"
                >
                  {visibleTableColumns.map((column, columnIndex) => {
                    const tdClassName =
                      typeof column.tdClassName === "function"
                        ? column.tdClassName(row)
                        : column.tdClassName;

                    return (
                      <td
                        key={column.key}
                        className={`py-2 px-2 align-middle ${tdClassName} ${
                          columnIndex < visibleTableColumns.length - 1
                            ? "border-r border-gray-200"
                            : ""
                        }`}
                      >
                        {column.render(row)}
                      </td>
                    );
                  })}
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
