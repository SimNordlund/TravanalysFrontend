import React, { useState } from "react";
import SpiderChart from "./SpiderChart";
import BarChart from "../BarChart";
import PaginatedLapTable from "./PaginatedLapTable"; // adjust path if needed
import Skrallar from "./Skrallar";

const ToggleComponent = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");
  const [selectedView, setSelectedView] = useState("bar");
  const [selectedHorse, setSelectedHorse] = useState(null); //Changed!

  /* ↓ if the user taps the “Diagram / Tabell / Analys” button              */
  /*   we reset the one-horse filter so Spider shows everything again.       */
  const switchView = (view) => {
    //Changed!
    setSelectedView(view); //Changed!
    if (view !== "spider") setSelectedHorse(null); //Changed!
  }; //Changed!

  const callouts = [
    {
      id: 1,
      name: "Diagram",
      bgColor: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600",
      view: "bar",
    },
    {
      id: 2,
      name: "Tabell",
      bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600",
      view: "table",
    },
    {
      id: 3,
      name: "Analys",
      bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600",
      view: "spider",
    },
    {
      id: 4,
      name: "Skrällar",
      bgColor: "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600",
      view: "skrallar",
    },
  ];

  return (
    <div className="text-center pt-12 pb-12 sm:pt-16 sm:pb-14">
      {/* Buttons */}

      <div className="flex justify-center gap-x-3.5 sm:gap-x-10 flex-nowrap overflow-auto mb-4 sm:mb-8 pt-3 pb-3">
        {callouts.map((c) => (
          <div
            key={c.id}
            className="group relative cursor-pointer"
            onClick={() => switchView(c.view)} /* Changed! */
          >
            <div
              className={`
                ${c.bgColor}
                relative h-14 w-20 sm:w-72 sm:h-18 mb-1 sm:mb-0 
                overflow-hidden rounded-md flex items-center justify-center
                transition-all duration-300 shadow-xl
                ${
                  selectedView === c.view
                    ? "ring-2 ring-slate-400 scale-110 opacity-100 cursor-default"
                    : "hover:opacity-80"
                }
              `}
            >
              <h3 className="sm:text-2xl font-semibold text-white text-center">
                {c.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart/Table toggle */}
      <div className="sm:max-w-4xl sm:mx-auto bg-white ml-4 mr-4 sm:pl-8 sm:pr-8 sm:pb-2 rounded-xl shadow-lg">
        {selectedView === "bar" && (
          <BarChart
            /* existing props … */
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}
            setSelectedLap={setSelectedLap}
            /* new → */ setSelectedView={setSelectedView} //Changed!
            setSelectedHorse={setSelectedHorse} //Changed!
          />
        )}

        {selectedView === "spider" && (
          <SpiderChart
            /* existing props … */
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}
            setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}
            setSelectedLap={setSelectedLap}
            /* new → */ selectedHorse={selectedHorse} 
          />
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
          /> // Corrected!
        )}
      </div>
    </div>
  );
};

export default ToggleComponent;
