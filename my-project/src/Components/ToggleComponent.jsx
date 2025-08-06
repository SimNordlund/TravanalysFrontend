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

  const routeToView = { analys: "spider", tabell: "table", speltips: "skrallar" }; 
  const viewToRoute = { spider: "analys", table: "tabell", skrallar: "speltips", bar: "analys" }; 

  const initialSelectedView = syncWithRoute ? (routeToView[viewParam] || "spider") : "spider"; 

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");
  const [selectedView, setSelectedView] = useState(initialSelectedView);
  const [selectedHorse, setSelectedHorse] = useState(null);

 
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

  const switchView = (viewKey) => {
    setViewAndMaybeNavigate(viewKey);
  };

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
              className={`
                ${c.bgColor}
                relative h-14 w-24 sm:w-72 sm:h-18 mb-1 sm:mb-0 
                overflow-hidden rounded-md flex items-center justify-center
                transition-all duration-300 shadow-xl
                ${selectedView === c.view ? "ring-2 ring-slate-600 scale-110 opacity-100 cursor-default" : "hover:opacity-80"}
              `}
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
          />
        </div>

  
        <div className={`${selectedView === "skrallar" ? "" : "hidden"} min-h-[600px]`}> 
          <Skrallar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setSelectedView={setViewAndMaybeNavigate}  
            setSelectedHorse={setSelectedHorse}
          />
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
