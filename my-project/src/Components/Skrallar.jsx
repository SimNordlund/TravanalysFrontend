import React, { useEffect, useState } from "react";
import DatePicker from "./DatePicker";

const Skrallar = ({
  selectedDate,
  setSelectedDate,
  setSelectedView,
  setSelectedHorse,
  dates,
  selectedTrack,                 
  setSelectedTrack,              
  selectedCompetition,           
  setSelectedCompetition,        
  selectedLap,                   
  setSelectedLap,                
  tracks,                        
  setPendingLapId,               
}) => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  //Hämta endast skrällar för valt datum
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
        const filtered = data.filter(
          (h) => !Number.isNaN(Number(h.tips)) && Number(h.tips) >= 1
        );
        if (!ac.signal.aborted) {
          setHorses(filtered.map((h, idx) => ({ ...h, position: idx + 1 })));
        }
      } catch {
        if (ac.signal.aborted) return;
        setError("Kunde inte hämta skrällar.");
        setHorses([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [selectedDate]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedHorses = [...horses].sort((a, b) => {
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

  const totalRoiTotalt = sortedHorses.reduce(
    (sum, row) => sum + (Number(row.roiTotalt) || 0),
    0
  );

  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () => idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () => idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);

  // Hoppa till rätt bana → spelform → lopp och markera häst
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
        trackId = list.find((t) => t.nameOfTrack === row.nameOfTrack)?.id || list[0]?.id;
      }
      if (!trackId) return;
      setSelectedTrack(trackId);

      // 2) COMPETITION
      let competitionId = row.competitionId ?? null;
      if (!competitionId) {
        const comps = await fetch(
          `${API_BASE_URL}/competition/findByTrack?trackId=${trackId}`
        ).then((r) => r.json());

        if (row.nameOfCompetition) {
          competitionId =
            comps.find((c) => c.nameOfCompetition === row.nameOfCompetition)?.id ?? null;
        }
        if (!competitionId && comps.length === 1) competitionId = comps[0].id;

        if (!competitionId && row.lap != null) {
          for (const c of comps) {
            const lapsJSON = await fetch(
              `${API_BASE_URL}/lap/findByCompetition?competitionId=${c.id}`
            ).then((r) => r.json());
            const found = lapsJSON.find(
              (l) =>
                String(l.nameOfLap) === String(row.lap) ||
                l.id === row.lapId
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
      setSelectedCompetition(competitionId);

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

      setPendingLapId(lapId);     
      setSelectedLap(lapId);                                       

      // 4) HÄSTINDEX I JUST DETTA LOPP
      let horseIndex = 0;
      try {
        const horsesInLap = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${lapId}`
        ).then((r) => r.json());
        const idx = horsesInLap.findIndex(
          (h) =>
            (row.completeHorseId && h.id === row.completeHorseId) ||
            (row.horseId && h.id === row.horseId) ||
            (
              String(h.numberOfCompleteHorse) === String(row.numberOfHorse) &&
              (h.nameOfCompleteHorse || "").toLowerCase() ===
                (row.nameOfHorse || "").toLowerCase()
            )
        );
        if (idx >= 0) horseIndex = idx;
      } catch {}

      setSelectedHorse(horseIndex);
      setSelectedView("spider");
    } catch (e) {
      console.error("handleRowClick error:", e);
    }
  };                                                                   

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
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8594;
        </button>
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
              <th onClick={() => requestSort("numberOfHorse")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">#</th>
              <th onClick={() => requestSort("nameOfHorse")} className="py-2 px-2 font-semibold cursor-pointer text-left border-r last:border-r-0 border-gray-300">Häst</th>
              <th onClick={() => requestSort("analys")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300 bg-orange-100">Analys</th>
              <th onClick={() => requestSort("resultat")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Placering</th>
              <th onClick={() => requestSort("roiTotalt")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">ROI Totalt</th>
              <th onClick={() => requestSort("roiVinnare")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">ROI Vinnare</th>
              <th onClick={() => requestSort("roiPlats")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">ROI Plats</th>
              <th onClick={() => requestSort("lap")} className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300">Lopp</th>
              <th onClick={() => requestSort("nameOfTrack")} className="py-2 px-2 font-semibold cursor-pointer">Bana</th>
            </tr>
          </thead>
          <tbody>
            {sortedHorses.map((row) => (
              <tr
                key={row.horseId ?? row.completeHorseId ?? `${row.nameOfHorse}-${row.lap}-${row.nameOfTrack}`}
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
                  {row.roiVinnare}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.roiPlats}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.lap}
                </td>
                <td className="py-2 px-2">{row.nameOfTrack}</td>
              </tr>
            ))}
            <tr className="font-semibold bg-gray-50">
              <td colSpan={4} className="py-2 px-2 text-right border-r border-gray-200">Summa:</td>
              <td className="py-2 px-2 border-r border-gray-200">{totalRoiTotalt}</td>
              <td className="py-2 px-2 border-r border-gray-200"></td>
              <td className="py-2 px-2 border-r border-gray-200"></td>
              <td className="py-2 px-2 border-r border-gray-200"></td>
              <td className="py-2 px-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
};

export default Skrallar;
