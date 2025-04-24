import React, { useEffect, useState } from "react";

const PaginatedLapTable = () => {
  /* ─── state ─────────────────────────────────────────────── */
  const [dates, setDates] = useState([]);                              //Changed!
  const [selectedDate, setSelectedDate] = useState("");                //Changed!

  const [tracks, setTracks] = useState([]);                            //Changed!
  const [selectedTrack, setSelectedTrack] = useState(null);            //Changed!

  const [competitions, setCompetitions] = useState([]);                //Changed!
  const [selectedCompetition, setSelectedCompetition] = useState(null);//Changed!
  const [competitionName, setCompetitionName] = useState("");

  const [laps, setLaps] = useState([]);
  const [selectedLap, setSelectedLap] = useState(null);

  const [lapData, setLapData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* ─── 0. fetch all dates, default to today ───────────────── */      //Changed!
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

  /* ─── 1. tracks when date changes ───────────────────────── */       //Changed!
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

  /* ─── 2. competitions when track changes ────────────────── */       //Changed!
  useEffect(() => {
    if (!selectedTrack) return;

    const fetchCompetitions = async () => {
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

    fetchCompetitions();
  }, [selectedTrack]);

  /* ─── 3. laps when competition changes ──────────────────── */       //Changed!
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

  /* ─── 4. table rows when lap changes ────────────────────── */
  useEffect(() => {
    if (!selectedLap) return;

    const fetchLapData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/completeHorse/findByLapAnalys?lapId=${selectedLap}`
        );
        setLapData(await res.json());
      } catch {
        setError("Failed to fetch lap data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLapData();
  }, [selectedLap]);

  /* ─── arrow nav helpers ─────────────────────────────────── */
  const idx = dates.findIndex((d) => d.date === selectedDate);
  const prevDisabled = idx <= 0;
  const nextDisabled = idx === -1 || idx >= dates.length - 1;
  const goPrev = () => !prevDisabled && setSelectedDate(dates[idx - 1].date);
  const goNext = () => !nextDisabled && setSelectedDate(dates[idx + 1].date);

  /* ─── Swedish date label (Idag / Igår / Imorgon) ────────── */
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 864e5)
    .toISOString()
    .split("T")[0];
  const tomorrowStr = new Date(Date.now() + 864e5)
    .toISOString()
    .split("T")[0];

  const sv = (d) =>
    new Date(d).toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  let niceDate = "";
  if (selectedDate === todayStr) niceDate = `Idag, ${sv(selectedDate)}`;
  else if (selectedDate === yesterdayStr) niceDate = `Igår, ${sv(selectedDate)}`;
  else if (selectedDate === tomorrowStr)
    niceDate = `Imorgon, ${sv(selectedDate)}`;
  else niceDate = sv(selectedDate);

  /* ─── JSX ───────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      {/* arrows + date */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          disabled={prevDisabled || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8592;
        </button>

        <h2 className="text-center text-lg sm:text-2xl font-semibold">
          {niceDate}
        </h2>

        <button
          onClick={goNext}
          disabled={nextDisabled || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8594;
        </button>
      </div>

      {/* track pills */}
      <div className="flex flex-wrap items-center gap-1 mb-2 min-h-[44px]"> {/*Changed!*/}
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            disabled={loading}
            className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
              t.id === selectedTrack
                ? "bg-emerald-500 text-white font-semibold shadow"
                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {t.nameOfTrack}
          </button>
        ))}
      </div>

      {/* competition pills */}
      <div className="flex flex-wrap items-center gap-1 mb-3 min-h-[44px]"> {/*Changed!*/}
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
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {c.nameOfCompetition}
          </button>
        ))}
      </div>

      {/* lap pills */}
      <div className="flex flex-wrap items-center gap-1 mb-3 min-h-[44px]">
        {laps.length ? (
          laps.map((lap) => (
            <button
              key={lap.id}
              onClick={() => setSelectedLap(lap.id)}
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
                lap.id === selectedLap
                  ? "bg-indigo-500 text-white font-semibold shadow"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {lap.nameOfLap}
            </button>
          ))
        ) : (
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-300 rounded w-20 h-8 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      {/* table */}
      <div className="overflow-x-auto border border-gray-200 rounded relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
          </div>
        )}

        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700 text-left border-b border-gray-200">
            <tr>
              <th className="py-2 px-2 font-semibold">#</th>
              <th className="py-2 px-2 font-semibold">Häst / Kusk</th>
              <th className="py-2 px-2 font-semibold">{competitionName}%</th>
              <th className="py-2 px-2 font-semibold">Trend%</th>
              <th className="py-2 px-2 font-semibold">V-Odds</th>
              <th className="py-2 px-2 font-semibold">Tränare</th>
              <th className="py-2 px-2 font-semibold">Tipskommentar</th>
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
                <td className="py-2 px-2">{row.fourStartsAnalys}</td>
                <td className="py-2 px-2">{row.trend}</td>
                <td className="py-2 px-2">{row.vOdds}</td>
                <td className="py-2 px-2">{row.trainer}</td>
                <td className="py-2 px-2">{row.tips}</td>
                <td className="py-2 px-2">{row.skor}</td>
                <td className="py-2 px-2">{row.vagn}</td>
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
