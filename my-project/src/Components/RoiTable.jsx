import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { Weight, ChevronLeft, ChevronRight } from "lucide-react"; 

const RoiTable = ({
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
  dates = [],
  tracks = [],
  competitions = [],
  laps = [],
  startsCount,
  setStartsCount,
  setSelectedView,
  setSelectedHorse,
  setPendingLapId,
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [rows, setRows] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "analys", direction: "desc" });

  const [localStartsCount, setLocalStartsCount] = useState(4);
  const activeStartsCount = startsCount ?? localStartsCount;
  const setActiveStartsCount = setStartsCount ?? setLocalStartsCount;

  const [availableCounts, setAvailableCounts] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  const [tipsFilter, setTipsFilter] = useState(1); 

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
    if (!selectedDate) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/completeHorse/getSkrallar?date=${selectedDate}`,
          { signal: ac.signal }
        );
        const data = await res.json();

        const raw = data
          .filter((h) => !Number.isNaN(Number(h.tips)))
          .map((h, idx) => ({ ...h, position: idx + 1 }));
        if (!ac.signal.aborted) setRows(raw);
      } catch {
        if (ac.signal.aborted) return;
        setError("Kunde inte hämta ROI-data.");
        setRows([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [selectedDate, API_BASE_URL]);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "";
  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)?.nameOfCompetition ??
    "";
  const selectedLapName =
    laps.find((l) => l.id === +selectedLap)?.nameOfLap ?? "";

  const lapPrefix = /proposition/i.test(selectedCompetitionLabel)
    ? "Prop"
    : /^(vinnare|plats)$/i.test(selectedCompetitionLabel.trim())
    ? "Lopp"
    : "Avd";

  const matchesTrack = (r) => {
    if (!selectedTrack) return true;
    if (r.trackId && +r.trackId === +selectedTrack) return true;
    return (r.nameOfTrack || "").toLowerCase() === selectedTrackLabel.toLowerCase();
  };

  const matchesCompetition = (r) => {
    if (!selectedCompetition) return true;
    if (r.competitionId && +r.competitionId === +selectedCompetition) return true;
    return (
      (r.nameOfCompetition || "").toLowerCase() ===
      selectedCompetitionLabel.toLowerCase()
    );
  };

  const matchesLap = (r) => {
    if (!selectedLap) return true;
    if (r.lapId && +r.lapId === +selectedLap) return true;
    return String(r.lap) === String(selectedLapName);
  };

  const visibleRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          Number(r.tips) === Number(tipsFilter) && // 1 (V&P) 2 (DD) 3 (Trio)
          matchesTrack(r) &&
          matchesCompetition(r) &&
          matchesLap(r)
      ),
    [
      rows,
      tipsFilter,
      selectedTrack,
      selectedCompetition,
      selectedLap,
      tracks,
      competitions,
      laps,
    ]
  );

  // Sortering
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const numericKeys = new Set([
    "numberOfHorse",
    "analys",
    "resultat",
    "roiTotalt",
    "roiVinnare",
    "roiPlats",
    "roiSinceDayOne",
  ]);

  const sortedRows = useMemo(() => {
    const data = [...visibleRows];
    if (!sortConfig.key) return data;
    return data.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined || bVal === undefined) return 0;
      const toNum = (v) =>
        typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
      const av = numericKeys.has(sortConfig.key)
        ? toNum(aVal)
        : typeof aVal === "string"
        ? aVal.toLowerCase()
        : aVal;
      const bv = numericKeys.has(sortConfig.key)
        ? toNum(bVal)
        : typeof bVal === "string"
        ? bVal.toLowerCase()
        : bVal;
      if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [visibleRows, sortConfig]);

  const totalRoiTotalt = useMemo(
    () =>
      sortedRows.reduce(
        (sum, r) => sum + (Number(String(r.roiTotalt).replace(",", ".")) || 0),
        0
      ),
    [sortedRows]
  );

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

  const handleRowClick = async (row) => {
    try {
      // 1) TRACK
      let trackId =
        row.trackId ??
        tracks.find((t) => t.nameOfTrack === row.nameOfTrack)?.id ??
        null;

      if (!trackId) {
        const list = await fetch(
          `${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`
        ).then((r) => r.json());
        trackId =
          list.find((t) => t.nameOfTrack === row.nameOfTrack)?.id || list[0]?.id;
      }
      if (!trackId) return;
      setSelectedTrack && setSelectedTrack(trackId);

      // 2) COMPETITION
      let competitionId = row.competitionId ?? null;
      if (!competitionId) {
        const comps = await fetch(
          `${API_BASE_URL}/competition/findByTrack?trackId=${trackId}`
        ).then((r) => r.json());

        if (row.nameOfCompetition) {
          competitionId =
            comps.find((c) => c.nameOfCompetition === row.nameOfCompetition)?.id ??
            null;
        }
        if (!competitionId && comps.length === 1) competitionId = comps[0].id;

        if (!competitionId && row.lap != null) {
          for (const c of comps) {
            const lapsJSON = await fetch(
              `${API_BASE_URL}/lap/findByCompetition?competitionId=${c.id}`
            ).then((r) => r.json());
            const found = lapsJSON.find(
              (l) =>
                String(l.nameOfLap) === String(row.lap) || l.id === row.lapId
            );
            if (found) {
              competitionId = c.id;
              row._resolvedLapId = found.id;
              break;
            }
          }
        }
      }
      if (!competitionId) return;
      setSelectedCompetition && setSelectedCompetition(competitionId);

      // 3) LAP
      let lapId = row.lapId ?? row._resolvedLapId ?? null;
      if (!lapId) {
        const lapsJSON = await fetch(
          `${API_BASE_URL}/lap/findByCompetition?competitionId=${competitionId}`
        ).then((r) => r.json());
        const match = lapsJSON.find(
          (l) => String(l.nameOfLap) === String(row.lap)
        );
        lapId = match?.id ?? null;
      }
      if (!lapId) return;

      setPendingLapId && setPendingLapId(lapId);
      setSelectedLap && setSelectedLap(lapId);

      // 4) HÄSTINDEX
      let horseIndex = 0;
      try {
        const horsesInLap = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${lapId}`
        ).then((r) => r.json());
        const idx = horsesInLap.findIndex(
          (h) =>
            (row.completeHorseId && h.id === row.completeHorseId) ||
            (row.horseId && h.id === row.horseId) ||
            (String(h.numberOfCompleteHorse) === String(row.numberOfHorse) &&
              (h.nameOfCompleteHorse || "").toLowerCase() ===
                (row.nameOfHorse || "").toLowerCase())
        );
        if (idx >= 0) horseIndex = idx;
      } catch {}
      setSelectedHorse && setSelectedHorse(horseIndex);
      setSelectedView && setSelectedView("spider");
    } catch (e) {
      console.error("handleRowClick error:", e);
    }
  };

  const formatSE = (v) => {
    if (v === null || v === undefined || v === "") return "";
    const num = Number(typeof v === "string" ? v.replace(",", ".") : v);
    if (!Number.isFinite(num)) return String(v);
    if (num !== 0) return num.toFixed(2);
    return "0";
  };

  const vinnareCompetitions = useMemo(
    () =>
      competitions.filter(
        (c) => (c.nameOfCompetition || "").toLowerCase() === "vinnare"
      ),
    [competitions]
  );

  useEffect(() => {
    const v = vinnareCompetitions[0];
    if (!v) return;
    if (!selectedCompetition || +selectedCompetition !== +v.id) {
      setSelectedCompetition && setSelectedCompetition(v.id);
    }
  }, [vinnareCompetitions]);

 
  const isSystemMode = tipsFilter === 2 || tipsFilter === 3; 
  const horseColTitle = isSystemMode ? "System" : "Häst"; 

  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      <p className="sm:text-xl text-lg font-semibold text-slate-800 mt-0 mb-4 sm:mt-0 sm:mb-5 px-4 py-1 flex flex-col justify-center items-center">
        {selectedDateLabel}{" "}
        {selectedTrackLabel ? `| ${selectedTrackLabel}` : ""}{" "}
        {selectedCompetitionLabel ? `| ${selectedCompetitionLabel}` : ""}
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

      <div className="flex flex-wrap gap-1 mb-2">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack && setSelectedTrack(t.id)}
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

      <div className="flex flex-wrap gap-1 mb-2">
        {vinnareCompetitions.map((c) => (
          <React.Fragment key={c.id}>
            <button
              onClick={() => {
                setSelectedCompetition && setSelectedCompetition(c.id);
                setTipsFilter(1);
              }}
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                c.id === +selectedCompetition && tipsFilter === 1
                  ? "bg-orange-600 text-white font-semibold shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              }`}
            >
              ROI V&P 
            </button>
            <button
              onClick={() => {
                setSelectedCompetition && setSelectedCompetition(c.id);
                setTipsFilter(2);
              }}
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                c.id === +selectedCompetition && tipsFilter === 2
                  ? "bg-purple-600 text-white font-semibold shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              }`}
            >
              ROI DD {/* tips = 2 */}
            </button>
            <button
              onClick={() => {
                setSelectedCompetition && setSelectedCompetition(c.id);
                setTipsFilter(3);
              }}
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                c.id === +selectedCompetition && tipsFilter === 3
                  ? "bg-green-600 text-white font-semibold shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              }`}
            >
              ROI TRIO {/* tips = 3 */}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Avdelningar */}
      <div className="flex flex-wrap gap-1 mb-2">
        {laps.map((lap) => (
          <button
            key={lap.id}
            onClick={() => setSelectedLap && setSelectedLap(lap.id)}
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

      {/* Tabellen */}
      <div className="overflow-x-auto border border-gray-200 rounded relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/70">
            <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-indigo-500 rounded-full" />
          </div>
        )}
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="py-2 px-2 font-semibold border-r last:border-r-0 border-gray-300">
                #
              </th>
              <th className="py-2 px-2 font-semibold text-left border-r last:border-r-0 border-gray-300">
                {horseColTitle} 
              </th>
              <th className="py-2 px-2 font-semibold border-r last:border-r-0 border-gray-300 bg-orange-100">
                Analys
              </th>
              <th className="py-2 px-2 font-semibold border-r last:border-r-0 border-gray-300">
                Placering
              </th>
              <th className="py-2 px-2 font-semibold border-r last:border-r-0 border-gray-300">
                ROI Lopp
              </th>
              <th className="py-2 px-2 font-semibold border-r last:border-r-0 border-gray-300">
                Odds Vinnare
              </th>
              <th className="py-2 px-2 font-semibold border-r last:border-r-0 border-gray-300">
                Odds Plats
              </th>
              <th className="py-2 px-2 font-semibold border-r last:border-r-0 border-gray-300">
                ROI Totalt
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={
                  row.horseId ??
                  row.completeHorseId ??
                  `${row.nameOfHorse}-${row.lap}-${row.nameOfTrack}`
                }
                onClick={() => handleRowClick(row)}
                className="border-b last:border-b-0 border-gray-200 hover:bg-blue-50 cursor-pointer even:bg-gray-50"
              >
                <td className="py-1 px-2 border-r border-gray-200 align-middle">
                  <span className="inline-block border border-orange-700 px-2 py-0.5 rounded-md text-sm font-medium bg-orange-100 shadow-sm">
                    {row.numberOfHorse}
                  </span>
                </td>
                <td className="py-2 px-2 text-left border-r border-gray-200">
                  {row.nameOfHorse}
                </td>
                <td className="py-2 px-2 border-r border-gray-200 bg-orange-50">
                  {row.analys}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.resultat}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.roiTotalt}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {formatSE(row.roiVinnare)}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {formatSE(row.roiPlats)}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.roiSinceDayOne}
                </td>
              </tr>
            ))}
            <tr className="font-semibold bg-gray-50">
              <td
                colSpan={4}
                className="py-2 px-2 text-right border-r border-gray-200"
              >
                Summa:
              </td>
              <td className="py-2 px-2 border-r border-gray-200">
                {totalRoiTotalt}
              </td>
              <td className="py-2 px-2 border-r border-gray-200"></td>
              <td className="py-2 px-2 border-r border-gray-200"></td>
              <td className="py-2 px-2 border-r border-gray-200"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
};

export default RoiTable;
