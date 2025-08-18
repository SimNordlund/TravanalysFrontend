import React, { useState, useEffect, useRef } from "react"; 
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SpiderChart from "./SpiderChart";
import BarChart from "../BarChart";
import PaginatedLapTable from "./PaginatedLapTable";
import Skrallar from "./Skrallar";

const ToggleComponent = ({ syncWithRoute = false }) => {
  const { view: viewParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const routeToView = {
    analys: "spider",
    tabell: "table",
    speltips: "skrallar",
  };
  const viewToRoute = {
    spider: "analys",
    table: "tabell",
    skrallar: "speltips",
    bar: "analys",
  };

  const initialSelectedView = syncWithRoute
    ? routeToView[viewParam] || "spider"
    : "spider";

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");
  const [selectedView, setSelectedView] = useState(initialSelectedView);
  const [selectedHorse, setSelectedHorse] = useState(null);

  const [dates, setDates] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [laps, setLaps] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const pendingLapRef = useRef(null);                 
  const setPendingLapId = (lapId) => {                
    pendingLapRef.current = lapId;                    
  };                                                  

  // Sync via URL
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

  // Närmaste datum till idag
  const pickClosestDate = (arr) => {
    if (!arr?.length) return "";
    const today = new Date();
    let best = arr[0];
    let bestDiff = Infinity;
    for (const d of arr) {
      const diff = Math.abs(new Date(d.date) - today);
      if (diff < bestDiff || (diff === bestDiff && new Date(d.date) >= today)) {
        best = d;
        bestDiff = diff;
      }
    }
    return best.date;
  };

  // 1) Hämta datum EN gång
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/track/dates`, {
          signal: ac.signal,
        });
        const all = await r.json();
        const uniqueSorted = Array.from(
          new Map(all.map((d) => [d.date, d])).values()
        ).sort((a, b) => a.date.localeCompare(b.date));
        setDates(uniqueSorted);

        if (!selectedDate) {
          const todayStr = new Date().toISOString().split("T")[0];
          const hasToday = uniqueSorted.find((x) => x.date === todayStr);
          setSelectedDate(hasToday ? todayStr : pickClosestDate(uniqueSorted));
        }
      } catch (e) {
        console.error("dates:", e);
      }
    })();
    return () => ac.abort();
  }, []);

  // 2) När datum finns, hämta banor
  useEffect(() => {
    if (!selectedDate) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`,
          { signal: ac.signal }
        );
        const d = await r.json();
        setTracks(d);
        if (!d?.length) {
          setSelectedTrack("");
          return;
        }
        const ok = d.some((t) => t.id === +selectedTrack);
        if (!ok) setSelectedTrack(d[0].id);
      } catch (e) {
        console.error("tracks:", e);
        setTracks([]);
      }
    })();
    return () => ac.abort();
  }, [selectedDate]);

  // 3) När bana finns, hämta spelformer
  useEffect(() => {
    if (!selectedTrack) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`,
          { signal: ac.signal }
        );
        const d = await r.json();
        setCompetitions(d);
        const ok = d?.some((c) => c.id === +selectedCompetition);
        if (!ok && d?.length) setSelectedCompetition(d[0].id);
      } catch (e) {
        console.error("competitions:", e);
        setCompetitions([]);
      }
    })();
    return () => ac.abort();
  }, [selectedTrack]);

  // 4) När spelform finns, hämta lopp
  useEffect(() => {
    if (!selectedCompetition) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`,
          { signal: ac.signal }
        );
        const d = await r.json();
        setLaps(d || []);

        // Respektera önskat lapId om det finns (för att undvika race) 
        const desired = pendingLapRef.current;                       
        if (desired && d?.some((l) => l.id === +desired)) {          
          setSelectedLap(desired);                                   
          pendingLapRef.current = null;                              
          return;                                                    
        }                                                            

        const ok = d?.some((l) => l.id === +selectedLap);
        if (!ok && d?.length) setSelectedLap(d[0].id);
      } catch (e) {
        console.error("laps:", e);
        setLaps([]);
      }
    })();
    return () => ac.abort();
  }, [selectedCompetition]);

  const callouts = [
    { id: 2, name: "Analys",  bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600", view: "spider" },
    { id: 3, name: "Tabell",  bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600", view: "table" },
    { id: 4, name: "Speltips", bgColor: "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600", view: "skrallar" },
  ];

  return (
    <div className="text-center pt-12 pb-12 sm:pt-16 sm:pb-14 bg-slate-100">
      <div className="flex justify-center gap-x-4 sm:gap-x-10 flex-nowrap overflow-auto mb-4 sm:mb-8 pt-2 pb-3">
        {callouts.map((c) => (
          <div
            key={c.id}
            className="group relative cursor-pointer"
            onClick={() => switchView(c.view)}
          >
            <div
              className={`${c.bgColor} relative h-14 w-24 sm:w-72 sm:h-18 mb-1 sm:mb-0 overflow-hidden rounded-md flex items-center justify-center transition-all duration-300 ${
                selectedView === c.view
                  ? "ring-2 ring-slate-800 scale-110 opacity-100 cursor-default"
                  : "hover:opacity-70"
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
              />
            </div>
            <div className="min-h-[400px]">
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
          />
        </div>

        <div className={`${selectedView === "skrallar" ? "" : "hidden"} min-h-[600px]`}>
          <Skrallar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}
            setSelectedLap={setSelectedLap}
            setSelectedView={setViewAndMaybeNavigate}
            setSelectedHorse={setSelectedHorse}
            dates={dates}
            tracks={tracks}
            setPendingLapId={setPendingLapId}         
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
