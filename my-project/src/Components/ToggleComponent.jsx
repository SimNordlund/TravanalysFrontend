// ToggleComponent.jsx
import React, { useState, useEffect } from "react";
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

  const [selectedDate, setSelectedDate] = useState(""); // unchanged
  const [selectedTrack, setSelectedTrack] = useState(""); // unchanged
  const [selectedCompetition, setSelectedCompetition] = useState(""); // unchanged
  const [selectedLap, setSelectedLap] = useState(""); // unchanged
  const [selectedView, setSelectedView] = useState(initialSelectedView);
  const [selectedHorse, setSelectedHorse] = useState(null);

  const [dates, setDates] = useState([]); //Changed!
  const [tracks, setTracks] = useState([]); //Changed!
  const [competitions, setCompetitions] = useState([]); //Changed!
  const [laps, setLaps] = useState([]); //Changed!
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; //Changed!

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

  // Helper: närmaste datum till idag //Changed!
  const pickClosestDate = (arr) => {
    //Changed!
    if (!arr?.length) return ""; //Changed!
    const today = new Date(); //Changed!
    let best = arr[0]; //Changed!
    let bestDiff = Infinity; //Changed!
    for (const d of arr) {
      //Changed!
      const diff = Math.abs(new Date(d.date) - today); //Changed!
      if (diff < bestDiff || (diff === bestDiff && new Date(d.date) >= today)) {
        // prefer framtid vid tie //Changed!
        best = d; //Changed!
        bestDiff = diff; //Changed!
      } //Changed!
    } //Changed!
    return best.date; //Changed!
  }; //Changed!

  // 1) Hämta datum EN gång //Changed!
  useEffect(() => {
    //Changed!
    const ac = new AbortController(); //Changed!
    (async () => {
      //Changed!
      try {
        //Changed!
        const r = await fetch(`${API_BASE_URL}/track/dates`, {
          signal: ac.signal,
        }); //Changed!
        const all = await r.json(); //Changed!
        const uniqueSorted = Array.from(
          new Map(all.map((d) => [d.date, d])).values()
        ) //Changed!
          .sort((a, b) => a.date.localeCompare(b.date)); //Changed!
        setDates(uniqueSorted); //Changed!

        if (!selectedDate) {
          //Changed!
          const todayStr = new Date().toISOString().split("T")[0]; //Changed!
          const hasToday = uniqueSorted.find((x) => x.date === todayStr); //Changed!
          setSelectedDate(hasToday ? todayStr : pickClosestDate(uniqueSorted)); //Changed!
        } //Changed!
      } catch (e) {
        //Changed!
        console.error("dates:", e); //Changed!
      } //Changed!
    })(); //Changed!
    return () => ac.abort(); //Changed!
  }, []); //Changed!

  // 2) När datum finns, hämta banor //Changed!
  useEffect(() => {
    //Changed!
    if (!selectedDate) return; //Changed!
    const ac = new AbortController(); //Changed!
    (async () => {
      //Changed!
      try {
        //Changed!
        const r = await fetch(
          `${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`,
          { signal: ac.signal }
        ); //Changed!
        const d = await r.json(); //Changed!
        setTracks(d); //Changed!
        if (!d?.length) {
          //Changed!
          setSelectedTrack(""); //Changed!
          return; //Changed!
        } //Changed!
        const ok = d.some((t) => t.id === +selectedTrack); //Changed!
        if (!ok) setSelectedTrack(d[0].id); //Changed!
      } catch (e) {
        //Changed!
        console.error("tracks:", e); //Changed!
        setTracks([]); //Changed!
      } //Changed!
    })(); //Changed!
    return () => ac.abort(); //Changed!
  }, [selectedDate]); //Changed!

  // 3) När bana finns, hämta spelformer //Changed!
  useEffect(() => {
    //Changed!
    if (!selectedTrack) return; //Changed!
    const ac = new AbortController(); //Changed!
    (async () => {
      //Changed!
      try {
        //Changed!
        const r = await fetch(
          `${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`,
          { signal: ac.signal }
        ); //Changed!
        const d = await r.json(); //Changed!
        setCompetitions(d); //Changed!
        const ok = d?.some((c) => c.id === +selectedCompetition); //Changed!
        if (!ok && d?.length) setSelectedCompetition(d[0].id); //Changed!
      } catch (e) {
        //Changed!
        console.error("competitions:", e); //Changed!
        setCompetitions([]); //Changed!
      } //Changed!
    })(); //Changed!
    return () => ac.abort(); //Changed!
  }, [selectedTrack]); //Changed!

  // 4) När spelform finns, hämta lopp //Changed!
  useEffect(() => {
    //Changed!
    if (!selectedCompetition) return; //Changed!
    const ac = new AbortController(); //Changed!
    (async () => {
      //Changed!
      try {
        //Changed!
        const r = await fetch(
          `${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`,
          { signal: ac.signal }
        ); //Changed!
        const d = await r.json(); //Changed!
        setLaps(d || []); //Changed!
        const ok = d?.some((l) => l.id === +selectedLap); //Changed!
        if (!ok && d?.length) setSelectedLap(d[0].id); //Changed!
      } catch (e) {
        //Changed!
        console.error("laps:", e); //Changed!
        setLaps([]); //Changed!
      } //Changed!
    })(); //Changed!
    return () => ac.abort(); //Changed!
  }, [selectedCompetition]); //Changed!

  const callouts = [
    {
      id: 2,
      name: "Analys",
      bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600",
      view: "spider",
    },
    {
      id: 3,
      name: "Tabell",
      bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600",
      view: "table",
    },
    {
      id: 4,
      name: "Speltips",
      bgColor: "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600",
      view: "skrallar",
    },
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
              className={`${
                c.bgColor
              } relative h-14 w-24 sm:w-72 sm:h-18 mb-1 sm:mb-0 overflow-hidden rounded-md flex items-center justify-center transition-all duration-300 ${
                selectedView === c.view
                  ? "ring-2 ring-slate-600 scale-110 opacity-100 cursor-default"
                  : "hover:opacity-80"
              }`}
            >
              <h3 className="sm:text-2xl font-semibold text-white text-center">
                {c.name}
              </h3>
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
                // nedan är nytt – skickar listor från föräldern //Changed!
                dates={dates} //Changed!
                tracks={tracks} //Changed!
                competitions={competitions} //Changed!
                laps={laps} //Changed!
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
                // inget eget hämt av filter i barn, de använder bara props
              />
            </div>
          </div>
        )}

        <div
          className={`${
            selectedView === "table" ? "" : "hidden"
          } min-h-[600px]`}
        >
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

        <div
          className={`${
            selectedView === "skrallar" ? "" : "hidden"
          } min-h-[600px]`}
        >
          <Skrallar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setSelectedView={setViewAndMaybeNavigate}
            setSelectedHorse={setSelectedHorse}
            dates={dates} 
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
