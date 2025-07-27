// Components/ToggleComponent.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Changed!
import SpiderChart from "./SpiderChart";
import BarChart from "../BarChart";
import PaginatedLapTable from "./PaginatedLapTable";
import Skrallar from "./Skrallar";

const ToggleComponent = ({ syncWithRoute = false }) => { // Changed!
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");
  const [selectedView, setSelectedView] = useState("spider");
  const [selectedHorse, setSelectedHorse] = useState(null);

  const { view: viewParam } = useParams(); // Changed!
  const navigate = useNavigate(); // Changed!

  // Mappning mellan URL-del och intern vy-nyckel
  const routeToView = { analys: "spider", tabell: "table", speltips: "skrallar" }; // Changed!
  const viewToRoute = { spider: "analys", table: "tabell", skrallar: "speltips", bar: "analys" }; // Changed!

  // Om vi kör i "route-läge": håll local state i synk med URL
  useEffect(() => { // Changed!
    if (!syncWithRoute) return; // Changed!
    const nextView = routeToView[viewParam] || "spider";
    setSelectedView(nextView);
    if (nextView !== "spider") setSelectedHorse(null);
  }, [syncWithRoute, viewParam]); // Changed!

  // Gemensam setter som även kan uppdatera URL i route-läge
  const setViewAndMaybeNavigate = (viewKey) => { // Changed!
    setSelectedView(viewKey);
    if (viewKey !== "spider") setSelectedHorse(null);
    if (syncWithRoute) {
      navigate(`/ChartPage/${viewToRoute[viewKey]}`);
    }
  };

  const switchView = (viewKey) => { // Changed!
    setViewAndMaybeNavigate(viewKey); // Changed!
  };

  const callouts = [
    { id: 2, name: "Analys",  bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600", view: "spider" },
    { id: 3, name: "Tabell",  bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600", view: "table" },
    { id: 4, name: "Speltips", bgColor: "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600", view: "skrallar" },
  ];

  return (
    <div className="text-center pt-12 pb-12 sm:pt-16 sm:pb-14">
      <div className="flex justify-center gap-x-4 sm:gap-x-10 flex-nowrap overflow-auto mb-4 sm:mb-8 pt-2 pb-3">
        {callouts.map((c) => (
          <div
            key={c.id}
            className="group relative cursor-pointer"
            onClick={() => switchView(c.view)} // Changed!
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

      <div className="sm:max-w-5xl sm:mx-auto bg-white ml-4 mr-4 sm:pl-8 sm:pr-8 sm:pb-2 rounded-xl shadow-lg">
        {/* Kombinerad BarChart + SpiderChart */}
        {(selectedView === "bar" || selectedView === "spider") && (
          <div className="grid grid-cols-1 gap-4">
            <BarChart 
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTrack={selectedTrack}
              setSelectedTrack={setSelectedTrack}
              selectedCompetition={selectedCompetition}
              setSelectedCompetition={setSelectedCompetition}
              selectedLap={selectedLap}
              setSelectedLap={setSelectedLap}
              setSelectedView={setViewAndMaybeNavigate}  // Changed!
              setSelectedHorse={setSelectedHorse}
            />
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
        )}

        {selectedView === "table" && (
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
        )}

        {selectedView === "skrallar" && (
          <Skrallar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setSelectedView={setViewAndMaybeNavigate}  // Changed!
            setSelectedHorse={setSelectedHorse}
          />
        )}
      </div>
    </div>
  );
};

export default ToggleComponent;
