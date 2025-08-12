import React, { useEffect, useState, useMemo } from "react"; 
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
}) => {
  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);
  const [lapData, setLapData] = useState([]);
  const [competitionName, setCompetitionName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const maxAnalysValue = useMemo(
    () => Math.max(...lapData.map((r) => Number(r.analys) || -Infinity)),
    [lapData]
  );


 
  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((r) => r.json())
      .then((all) => {
        if (!all.length) return;
  
        const uniqueDates = Array.from(new Set(all.map((d) => d.date)))
          .sort()
          .map((date) => ({ date }));
        setDates(uniqueDates);
        if (!selectedDate) {
          const todayStr = new Date().toISOString().split("T")[0];
          const todayObj = uniqueDates.find((d) => d.date === todayStr);
          setSelectedDate(
            todayObj ? todayObj.date : uniqueDates[uniqueDates.length - 1].date
          );
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
        if (t.length) {
          setSelectedTrack(t[0].id);
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
            setSelectedCompetition(comps[0].id);
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
          if (lapsJSON.length) setSelectedLap(lapsJSON[0].id);
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
        );
        const horses = await res.json();

        const rows = await Promise.all(
          horses.map(async (h, idx) => {
            const fsRes = await fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${h.id}`
            );
            const fs = await fsRes.json();
            return {
              ...h,
              ...fs,
              position: idx + 1,
            };
          })
        );
        setLapData(rows);
        setSortConfig({ key: "numberOfCompleteHorse", direction: "asc" });
      } catch {
        setError("Failed to fetch lap data.");
        setLapData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLap]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedLapData = [...lapData].sort((a, b) => {
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

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          min={dates[0]?.date}
          max={dates[dates.length - 1]?.date}
        />

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
            Lopp {lap.nameOfLap}
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
                {competitionName || "Analys"}
              </th>
              <th
                onClick={() => requestSort("fart")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Tid
              </th>
              <th
                onClick={() => requestSort("styrka")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Prestation
              </th>
              <thcd
                onClick={() => requestSort("klass")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Motstånd
              </th>
               {/* 
              <th
                onClick={() => requestSort("prispengar")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Prispengar
              </th>
              <th
                onClick={() => requestSort("kusk")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Stallskrik
              </th>
             */}
            </tr>
          </thead>

          <tbody>
            {sortedLapData.map((row) => {
              const isMax = Number(row.analys) === maxAnalysValue;
              return (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 border-gray-200 hover:bg-gray-100 even:bg-gray-50 cursor-pointer"
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
                    {row.fart}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.styrka}
                  </td>
                  <td className="py-2 px-2 border-r border-gray-200">
                    {row.klass}
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
