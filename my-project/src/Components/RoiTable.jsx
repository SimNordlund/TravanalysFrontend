import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [sortConfig, setSortConfig] = useState({
    key: "analys",
    direction: "desc",
  });

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
          { signal: ac.signal },
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
          { signal: ac.signal },
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
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "";
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
    return (
      (r.nameOfTrack || "").toLowerCase() === selectedTrackLabel.toLowerCase()
    );
  };

  const matchesCompetition = (r) => {
    if (!selectedCompetition) return true;
    if (r.competitionId && +r.competitionId === +selectedCompetition)
      return true;
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
          (Array.isArray(r.tipCategories)
            ? r.tipCategories.includes(Number(tipsFilter))
            : String(r.tips ?? "").includes(String(tipsFilter))) &&
          matchesTrack(r) &&
          matchesCompetition(r) &&
          matchesLap(r),
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
    ],
  );

  // Sortering
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
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
        0,
      ),
    [sortedRows],
  );

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

  const isSystemMode = tipsFilter === 2 || tipsFilter === 3;
  const horseColTitle = isSystemMode ? "System" : "Häst";

  return (
    <div className="analytics-section relative mx-auto w-full max-w-screen-xl">
      <div className="chart-panel-heading">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white text-indigo-600 shadow-sm">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="chart-kicker">Resultatöversikt</p>
            <h2 className="chart-title">Spel &amp; ROI</h2>
            <p className="chart-description">
              Analys, placering och ROI per lopp.
            </p>
          </div>
        </div>
      </div>

      <p className="analytics-context">
        <span className="max-w-full break-words font-semibold text-slate-700">
          {selectedDateLabel}
        </span>
        <span
          className="h-1 w-1 shrink-0 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <span className="max-w-full break-words text-slate-600">
          {selectedTrackLabel}
        </span>
        <span
          className="h-1 w-1 shrink-0 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <span className="max-w-full break-words font-semibold text-indigo-600">
          {selectedCompetitionLabel}
        </span>
      </p>

      <div className="analytics-date-nav chart-date-controls">
        <button
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          aria-label="Föregående datum"
          className="analytics-arrow"
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
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          aria-label="Nästa datum"
          className="analytics-arrow"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Banor */}
      <div className="analytics-filter-row">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack && setSelectedTrack(t.id)}
            disabled={loading}
            aria-pressed={t.id === +selectedTrack}
            className={`chart-filter ${
              t.id === +selectedTrack ? "chart-filter-active" : ""
            }`}
          >
            {t.nameOfTrack}
          </button>
        ))}
      </div>
      <div className="analytics-filter-row">
        <button
          onClick={() => setTipsFilter(1)}
          disabled={loading}
          aria-pressed={tipsFilter === 1}
          className={`chart-filter ${
            tipsFilter === 1 ? "chart-filter-active" : ""
          }`}
        >
          ROI V&P
        </button>
        {/* 
        <button
          onClick={() => setTipsFilter(2)}
          disabled={loading}
          className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
            tipsFilter === 2
              ? "bg-purple-600 text-white font-semibold shadow"
              : "bg-gray-200 text-gray-700 hover:bg-blue-200"
          }`}
        >
          ROI Tvilling
        </button> */}
        <button
          onClick={() => setTipsFilter(3)}
          disabled={loading}
          aria-pressed={tipsFilter === 3}
          className={`chart-filter ${
            tipsFilter === 3 ? "chart-filter-active" : ""
          }`}
        > 
          ROI Trio
        </button>
      </div>

      {/* Avdelningar */}
      <div className="analytics-filter-row">
        {laps.map((lap) => (
          <button
            key={lap.id}
            onClick={() => setSelectedLap && setSelectedLap(lap.id)}
            disabled={loading}
            aria-pressed={lap.id === +selectedLap}
            className={`chart-filter ${
              lap.id === +selectedLap ? "chart-filter-active" : ""
            }`}
          >
            {`${lapPrefix} ${lap.nameOfLap}`}
          </button>
        ))}
      </div>

      {/* Tabellen */}
      <div
        className="analytics-table-wrap relative mt-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
        tabIndex={0}
        role="region"
        aria-label="ROI-tabell"
        aria-busy={loading}
      >
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[2px]"
            role="status"
          >
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-500 motion-reduce:animate-none" />
            <span className="sr-only">Laddar ROI-data.</span>
          </div>
        )}
        <table className="analytics-table min-w-[720px] text-center">
          <thead>
            <tr>
              <th scope="col" className="w-14 text-center">
                #
              </th>
              <th scope="col" className="min-w-[160px] text-left">
                {horseColTitle}
              </th>
              <th scope="col" className="!bg-indigo-50 !text-indigo-700">
                Analys
              </th>
              <th scope="col">
                Placering
              </th>
              <th scope="col">
                ROI Lopp
              </th>
              <th scope="col">
                Odds Vinnare
              </th>
              <th scope="col">
                Odds Plats
              </th>
              <th scope="col">
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
                className="group cursor-pointer"
              >
                <td className="align-middle">
                  <span className="analytics-number">
                    {row.numberOfHorse}
                  </span>
                </td>
                <td className="text-left font-semibold text-slate-800">
                  <span className="block min-w-[136px] max-w-[19rem] whitespace-normal break-words group-hover:text-indigo-700">
                    {row.nameOfHorse}
                  </span>
                </td>
                <td className="!bg-indigo-50/60 font-bold text-indigo-700">
                  {row.analys}
                </td>
                <td className="font-medium">
                  {row.resultat}
                </td>
                <td className="font-semibold text-slate-700">
                  {row.roiTotalt}
                </td>
                <td>
                  {formatSE(row.roiVinnare)}
                </td>
                <td>
                  {formatSE(row.roiPlats)}
                </td>
                <td className="font-semibold text-slate-700">
                  {row.roiSinceDayOne}
                </td>
              </tr>
            ))}
            <tr className="!bg-indigo-50/60 font-semibold text-indigo-900">
              <td
                colSpan={4}
                className="!border-t !border-indigo-100 !py-4 text-right"
              >
                Summa:
              </td>
              <td className="!border-t !border-indigo-100 !py-4">
                <span className="inline-flex min-w-[3rem] items-center justify-center rounded-lg border border-indigo-200/70 bg-white px-2.5 py-1 font-bold text-indigo-700 shadow-sm">
                  {totalRoiTotalt}
                </span>
              </td>
              <td className="!border-t !border-indigo-100 !py-4"></td>
              <td className="!border-t !border-indigo-100 !py-4"></td>
              <td className="!border-t !border-indigo-100 !py-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && <div className="analytics-error mt-4">{error}</div>}
    </div>
  );

  function formatSE(v) {
    if (v === null || v === undefined || v === "") return "";
    const num = Number(typeof v === "string" ? v.replace(",", ".") : v);
    if (!Number.isFinite(num)) return String(v);
    if (num !== 0) return num.toFixed(2);
    return "0";
  }

  async function handleRowClick(row) {
    try {
      // 1) TRACK
      let trackId =
        row.trackId ??
        tracks.find((t) => t.nameOfTrack === row.nameOfTrack)?.id ??
        null;

      if (!trackId) {
        const list = await fetch(
          `${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`,
        ).then((r) => r.json());
        trackId =
          list.find((t) => t.nameOfTrack === row.nameOfTrack)?.id ||
          list[0]?.id;
      }
      if (!trackId) return;
      setSelectedTrack && setSelectedTrack(trackId);

      // 2) COMPETITION
      let competitionId = row.competitionId ?? null;
      if (!competitionId) {
        const comps = await fetch(
          `${API_BASE_URL}/competition/findByTrack?trackId=${trackId}`,
        ).then((r) => r.json());

        if (row.nameOfCompetition) {
          competitionId =
            comps.find((c) => c.nameOfCompetition === row.nameOfCompetition)
              ?.id ?? null;
        }
        if (!competitionId && comps.length === 1) competitionId = comps[0].id;

        if (!competitionId && row.lap != null) {
          for (const c of comps) {
            const lapsJSON = await fetch(
              `${API_BASE_URL}/lap/findByCompetition?competitionId=${c.id}`,
            ).then((r) => r.json());
            const found = lapsJSON.find(
              (l) =>
                String(l.nameOfLap) === String(row.lap) || l.id === row.lapId,
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
          `${API_BASE_URL}/lap/findByCompetition?competitionId=${competitionId}`,
        ).then((r) => r.json());
        const match = lapsJSON.find(
          (l) => String(l.nameOfLap) === String(row.lap),
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
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${lapId}`,
        ).then((r) => r.json());
        const idx = horsesInLap.findIndex(
          (h) =>
            (row.completeHorseId && h.id === row.completeHorseId) ||
            (row.horseId && h.id === row.horseId) ||
            (String(h.numberOfCompleteHorse) === String(row.numberOfHorse) &&
              (h.nameOfCompleteHorse || "").toLowerCase() ===
                (row.nameOfHorse || "").toLowerCase()),
        );
        if (idx >= 0) horseIndex = idx;
      } catch {}
      setSelectedHorse && setSelectedHorse(horseIndex);
      setSelectedView && setSelectedView("spider");
    } catch (e) {
      console.error("handleRowClick error:", e);
    }
  }
};

export default RoiTable;
