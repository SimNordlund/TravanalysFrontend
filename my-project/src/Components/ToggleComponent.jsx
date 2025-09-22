import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SpiderChart from "./SpiderChart";
import BarChart from "../BarChart";
import PaginatedLapTable from "./PaginatedLapTable";

import AnalysChart from "./AnalysChart";
import SharedHorseLegend from "./SharedHorseLegend";
import RoiTable from "./RoiTable";

const ToggleComponent = ({ syncWithRoute = false }) => {
  const { view: viewParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const routeToView = { analys: "spider", tabell: "table", speltips: "skrallar" };
  const viewToRoute = { spider: "analys", table: "tabell", skrallar: "speltips", bar: "analys" };

  const initialSelectedView = syncWithRoute ? routeToView[viewParam] || "spider" : "spider";

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");
  const [selectedView, setSelectedView] = useState(initialSelectedView);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [startsCount, setStartsCount] = useState(4);

  const [visibleHorseIdxes, setVisibleHorseIdxes] = useState([]);
  const [horseLegendItems, setHorseLegendItems] = useState([]);
  const [top5Idxes, setTop5Idxes] = useState([]);
  const [top3Idxes, setTop3Idxes] = useState([]);

  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const pendingLapRef = useRef(null);
  const setPendingLapId = (lapId) => { pendingLapRef.current = lapId; };

  const [legendMode, setLegendMode] = useState("all"); //Changed!

  useEffect(() => {
    if (!syncWithRoute) return;
    const nextView = routeToView[viewParam] || "spider";
    setSelectedView(nextView);
    if (nextView !== "spider") setSelectedHorse(null);
  }, [syncWithRoute, viewParam]);

  const setViewAndMaybeNavigate = (viewKey) => {
    setSelectedView(viewKey);
    if (viewKey !== "spider") setSelectedHorse(null);
    if (syncWithRoute) {
      const target = `/ChartPage/${viewToRoute[viewKey]}`;
      if (location.pathname !== target) navigate(target);
    }
  };

  const switchView = (viewKey) => setViewAndMaybeNavigate(viewKey);

  const pickClosestDate = (arr) => {
    if (!arr?.length) return "";
    const today = new Date();
    let best = arr[0], bestDiff = Infinity;
    for (const d of arr) {
      const diff = Math.abs(new Date(d.date) - today);
      if (diff < bestDiff || (diff === bestDiff && new Date(d.date) >= today)) {
        best = d; bestDiff = diff;
      }
    }
    return best.date;
  };

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/track/dates`, { signal: ac.signal });
        const all = await r.json();
        const uniqueSorted = Array.from(new Map(all.map((d) => [d.date, d])).values())
          .sort((a, b) => a.date.localeCompare(b.date));
        setDates(uniqueSorted);
        if (!selectedDate) {
          const todayStr = new Date().toISOString().split("T")[0];
          const hasToday = uniqueSorted.find((x) => x.date === todayStr);
          setSelectedDate(hasToday ? todayStr : pickClosestDate(uniqueSorted));
        }
      } catch (e) { console.error("dates:", e); }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`, { signal: ac.signal });
        const d = await r.json();
        setTracks(d);
        if (!d?.length) { setSelectedTrack(""); return; }
        const ok = d.some((t) => t.id === +selectedTrack);
        if (!ok) setSelectedTrack(d[0].id);
      } catch (e) { console.error("tracks:", e); setTracks([]); }
    })();
    return () => ac.abort();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedTrack) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`, { signal: ac.signal });
        const d = await r.json();
        setCompetitions(d);
        const ok = d?.some((c) => c.id === +selectedCompetition);
        if (!ok && d?.length) setSelectedCompetition(d[0].id);
      } catch (e) { console.error("competitions:", e); setCompetitions([]); }
    })();
    return () => ac.abort();
  }, [selectedTrack]);

  useEffect(() => {
    if (!selectedCompetition) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`, { signal: ac.signal });
        const d = await r.json();
        setLaps(d || []);
        const desired = pendingLapRef.current;
        if (desired && d?.some((l) => l.id === +desired)) {
          setSelectedLap(desired); pendingLapRef.current = null; return;
        }
        const ok = d?.some((l) => l.id === +selectedLap);
        if (!ok && d?.length) setSelectedLap(d[0].id);
      } catch (e) { console.error("laps:", e); setLaps([]); }
    })();
    return () => ac.abort();
  }, [selectedCompetition]);

  useEffect(() => {
    setSelectedHorse(null);
    setVisibleHorseIdxes([]);
  }, [selectedLap]);

  const handleMetaChange = ({ items, suggestedVisibleIdxes, top5Idx, top3Idx }) => {
    setHorseLegendItems(items || []);
    setVisibleHorseIdxes((prev) => (
      legendMode === "top3" && Array.isArray(top3Idx) ? top3Idx     //Changed!
      : legendMode === "top5" && Array.isArray(top5Idx) ? top5Idx   //Changed!
      : (prev?.length ? prev : (suggestedVisibleIdxes || []))       //Changed!
    ));
    if (Array.isArray(top5Idx)) setTop5Idxes(top5Idx);
    if (Array.isArray(top3Idx)) setTop3Idxes(top3Idx);
  };

  const toggleLegendIdx = (idx) =>
    setVisibleHorseIdxes((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const showAllLegend = () => {                                 //Changed!
    setLegendMode("all");                                       //Changed!
    setVisibleHorseIdxes(horseLegendItems.map((x) => x.idx));   //Changed!
  };
  const showTop5Legend = () => {                                //Changed!
    setLegendMode("top5");                                      //Changed!
    setVisibleHorseIdxes(top5Idxes);                            //Changed!
  };
  const showTop3Legend = () => {                                //Changed!
    setLegendMode("top3");                                      //Changed!
    setVisibleHorseIdxes(top3Idxes);                            //Changed!
  };

  const callouts = [
    { id: 2, name: "Analys", bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600", view: "spider" },
    { id: 3, name: "Ranking", bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600", view: "table" },
    { id: 4, name: "Spel & ROI", bgColor: "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600", view: "skrallar" },
  ];

  return (
    <div className="text-center pt-12 pb-12 sm:pt-16 sm:pb-14 bg-slate-100">
      <div className="flex justify-center gap-x-4 sm:gap-x-10 flex-nowrap overflow-auto mb-4 sm:mb-8 pt-2 pb-3">
        {callouts.map((c) => (
          <div key={c.id} className="group relative cursor-pointer" onClick={() => switchView(c.view)}>
            <div
              className={`${c.bgColor} relative h-14 w-24 lg:w-72 lg:h-18 md:w-52 md:h-18  mb-1 sm:mb-0 overflow-hidden rounded-md flex items-center justify-center transition-all duration-300 ${
                selectedView === c.view ? "ring-2 ring-slate-800 scale-110 opacity-100 cursor-default" : "hover:opacity-70"
              }`}
            >
              <h3 className="sm:text-2xl font-semibold text-white text-center">{c.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="sm:max-w-5xl sm:mx-auto bg-white ml-4 mr-4 sm:pl-8 sm:pr-8 sm:pb-2 rounded-xl shadow-lg min-h-[70vh]">
        {(selectedView === "bar" || selectedView === "spider") && (
          <div className="grid grid-cols-1 gap-4">
            <div className="min-h-[400px]">
              <BarChart
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTrack={selectedTrack}
                setSelectedTrack={setSelectedTrack}
                selectedCompetition={selectedCompetition}
                setSelectedCompetition={setSelectedCompetition}
                selectedLap={selectedLap}
                setSelectedLap={setSelectedLap}
                dates={dates}
                tracks={tracks}
                competitions={competitions}
                laps={laps}
                setSelectedView={setViewAndMaybeNavigate}
                setSelectedHorse={setSelectedHorse}
                setVisibleHorseIdxes={setVisibleHorseIdxes}
                startsCount={startsCount}
                setStartsCount={setStartsCount}
                setLegendMode={setLegendMode}        //Changed!
              />
            </div>

            <div className="min-h-[400px] sm:grid sm:grid-cols-[minmax(0,1fr)_16rem] sm:gap-6">
              <div className="min-w-0">
                <SpiderChart
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTrack={selectedTrack}
                  setSelectedTrack={setSelectedTrack}
                  selectedCompetition={selectedCompetition}
                  setSelectedCompetition={setSelectedCompetition}
                  selectedLap={selectedLap}
                  setSelectedLap={setSelectedLap}
                  selectedHorse={selectedHorse}
                  visibleHorseIdxes={visibleHorseIdxes}
                  onMetaChange={handleMetaChange}
                  startsCount={startsCount}
                />
              </div>
              <div className="mt-0 ml-4 sm:mt-28 sm:justify-self-end sm:w-64 shrink-0">
                <SharedHorseLegend
                  items={horseLegendItems}
                  visibleIdxes={visibleHorseIdxes}
                  onToggle={toggleLegendIdx}
                  onShowAll={showAllLegend}
                  onShowTop5={showTop5Legend}
                  onShowTop3={showTop3Legend}
                  active={legendMode}                 //Changed!
                />
              </div>
            </div>

            <div className="min-h-[200px]">
              <AnalysChart
                selectedLap={selectedLap}
                selectedHorse={selectedHorse}
                visibleHorseIdxes={visibleHorseIdxes}
                startsCount={startsCount}
              />
            </div>
          </div>
        )}

        <div className={`${selectedView === "table" ? "" : "hidden"} min-h-[600px]`}>
          <PaginatedLapTable
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}
            setSelectedLap={setSelectedLap}
            dates={dates}
            tracks={tracks}
            competitions={competitions}
            laps={laps}
            startsCount={startsCount}
            setStartsCount={setStartsCount}
          />
        </div>

        <div className={`${selectedView === "skrallar" ? "" : "hidden"} min-h-[600px]`}>
          <RoiTable
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}
            setSelectedLap={setSelectedLap}
            dates={dates}
            tracks={tracks}
            competitions={competitions}
            laps={laps}
            startsCount={startsCount}
            setStartsCount={setStartsCount}
            setSelectedView={setViewAndMaybeNavigate}
            setSelectedHorse={setSelectedHorse}
            setPendingLapId={setPendingLapId}
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
