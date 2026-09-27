import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Trophy,
} from "lucide-react";

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

const getHorsePlacement = (name) => {
  const match = String(name ?? "").match(/\((\d+)\)\s*$/);
  return match ? Number(match[1]) : null;
};

const removeHorsePlacementMarker = (name) =>
  String(name ?? "").replace(/\s*\(\d+\)\s*$/, "").trim();

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
      tdClassName: "text-center",
      render: (row) => (
        <span className="analytics-number">
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
        <div className="flex min-w-[7rem] items-center gap-2.5 sm:min-w-[10rem]">
          {!visibleColumnSet.has("numberOfCompleteHorse") && (
            <span className="analytics-number shrink-0">
              {row.numberOfCompleteHorse}
            </span>
          )}
          <span className="min-w-0 whitespace-normal font-semibold leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
            {row.nameOfCompleteHorse}
          </span>
        </div>
      ),
    },
    {
      key: "analys",
      label: competitionName,
      sortKey: "analys",
      thClassName: "!bg-indigo-50 text-center !text-indigo-700",
      tdClassName: (row) =>
        Number(row.analys) === maxAnalysValue
          ? "bg-indigo-100/80 font-bold text-center !text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)]"
          : "bg-indigo-50/50 text-center !text-indigo-600",
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

  const winnerHorse = lapData.find(
    (row) => getHorsePlacement(row.nameOfCompleteHorse) === 1
  );
  const winnerHorseName = winnerHorse
    ? removeHorsePlacementMarker(winnerHorse.nameOfCompleteHorse)
    : "";
  const hasWinnerOdds =
    winnerHorse?.vOdds !== null &&
    winnerHorse?.vOdds !== undefined &&
    String(winnerHorse.vOdds).trim() !== "";

  return (
    <div className="analytics-section relative mx-auto w-full">
      <div className="chart-panel-heading">
        <div>
          <p className="chart-kicker">Hästar & prestation</p>
          <h2 className="chart-title">Ranking</h2>
          <p className="chart-description">
            Jämför hästarna, välj dina kolumner och sortera efter det som är viktigt för dig.
          </p>
        </div>
        <span
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-500 sm:flex"
          aria-hidden="true"
        >
          <Columns3 className="h-5 w-5" />
        </span>
      </div>

      <p className="analytics-context">
        <span className="max-w-full break-words">{selectedDateLabel}</span>
        <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
        <span className="break-words text-slate-600">{selectedTrackLabel}</span>
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600">
          {selectedCompetitionLabel}
        </span>
      </p>

      <div className="analytics-date-nav chart-date-controls">
        <button
          type="button"
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          className="analytics-arrow"
          aria-label="Föregående datum"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          min={dates[0]?.date}
          max={dates[dates.length - 1]?.date}
          availableDates={dates.map((d) => d.date)}
        />

        <button
          type="button"
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          className="analytics-arrow"
          aria-label="Nästa datum"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Track buttons */}
      <div className="analytics-filter-row">
        {tracks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTrack(t.id)}
            disabled={loading}
            aria-pressed={t.id === +selectedTrack}
            className={`chart-filter ${
              t.id === +selectedTrack
                ? "chart-filter-active"
                : ""
            }`}
          >
            {t.nameOfTrack}
          </button>
        ))}
      </div>

      {/* Competition buttons */}
      <div className="analytics-filter-row">
        {competitions.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCompetition(c.id)}
            disabled={loading}
            aria-pressed={c.id === +selectedCompetition}
            className={`chart-filter ${
              c.id === +selectedCompetition
                ? "chart-filter-active"
                : ""
            }`}
          >
            {c.nameOfCompetition}
          </button>
        ))}
      </div>

      <div className="analytics-filter-row">
        {laps.map((lap) => {
          
          const lapNo = String(lap.nameOfLap ?? "").trim(); 
          const lapText = isSmallScreen
            ? `${lapPrefix}${lapNo}` 
            : `${lapPrefix} ${lapNo}`; 

          return (
            <button
              key={lap.id}
              type="button"
              onClick={() => setSelectedLap(lap.id)}
              disabled={loading}
              aria-pressed={lap.id === +selectedLap}
              className={`chart-filter ${
                lap.id === +selectedLap
                  ? "chart-filter-active"
                  : ""
              }`}
            >
              {lapText} {/*Changed!*/}
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex min-h-[40px] flex-wrap items-start gap-1.5 border-b border-slate-100 pb-4">
        {!availLoading &&
          availableCounts.map((n) => (
            <button
              key={String(n)}
              type="button"
              onClick={() => setActiveStartsCount(normalizeStarter(n))}
              disabled={loading}
              aria-pressed={
                normalizeStarter(activeStartsCount) === normalizeStarter(n)
              }
              className={`chart-filter ${
                normalizeStarter(activeStartsCount) === normalizeStarter(n)
                  ? "chart-filter-active"
                  : ""
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {starterLabel(n)}
            </button>
          ))}
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Columns3 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            Visa kolumner
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyColumnPreset(ALL_COLUMN_KEYS)}
              className="chart-filter"
            >
              Alla
            </button>
            <button
              type="button"
              onClick={() => applyColumnPreset(MOBILE_DEFAULT_COLUMN_KEYS)}
              className="chart-filter"
            >
              Mobil
            </button>
            <button
              type="button"
              onClick={resetVisibleColumns}
              className="chart-filter"
            >
              Nollställ
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200/70 pt-3">
          {columns.map((column) => {
            const active = visibleColumnSet.has(column.key);

            return (
              <button
                key={column.key}
                type="button"
                onClick={() => toggleColumn(column.key)}
                aria-pressed={active}
                className={`chart-filter gap-1.5 ${
                  active
                    ? "chart-filter-active"
                    : ""
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                    active ? "border-white/40 bg-white/15" : "border-slate-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                {column.label}
              </button>
            );
          })}
        </div>
      </div>

      {!loading && winnerHorse && (
        <div className="analytics-winner mb-4">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"
            aria-hidden="true"
          >
            <Trophy className="h-4 w-4" />
          </span>
          <span className="min-w-0 break-words">
            Vinnare: {winnerHorseName}
            {hasWinnerOdds ? `, Odds: ${winnerHorse.vOdds}` : ""}
          </span>
        </div>
      )}

      <div
        className="analytics-table-wrap relative"
        tabIndex={0}
        role="region"
        aria-label="Rankingtabell"
        aria-busy={loading}
      >
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[2px]"
            role="status"
            aria-label="Laddar ranking"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-500 motion-reduce:animate-none" />
          </div>
        )}

        <table className="analytics-table">
          <thead>
            <tr>
              {visibleTableColumns.map((column, columnIndex) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sortConfig.key === column.sortKey
                      ? sortConfig.direction === "asc" ? "ascending" : "descending"
                      : "none"
                  }
                  className={`whitespace-nowrap ${
                    column.thClassName
                  } ${
                    columnIndex < visibleTableColumns.length - 1
                      ? "border-r border-slate-200/70"
                      : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => requestSort(column.sortKey)}
                    className={`inline-flex min-h-8 items-center gap-1 rounded-md font-semibold transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${sortConfig.key === column.sortKey ? "text-indigo-600" : ""}`}
                  >
                    {column.label}
                    {sortConfig.key === column.sortKey ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="h-3 w-3 shrink-0" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="h-3 w-3 shrink-0" aria-hidden="true" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 shrink-0 text-slate-300" aria-hidden="true" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedLapData.map((row) => {
              return (
                <tr key={row.id}>
                  {visibleTableColumns.map((column, columnIndex) => {
                    const tdClassName =
                      typeof column.tdClassName === "function"
                        ? column.tdClassName(row)
                        : column.tdClassName;

                    return (
                      <td
                        key={column.key}
                        className={`align-middle ${tdClassName} ${
                          columnIndex < visibleTableColumns.length - 1
                            ? "border-r border-slate-100"
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

      {error && <div className="analytics-error mt-4">{error}</div>}
    </div>
  );
};

export default PaginatedLapTable;
