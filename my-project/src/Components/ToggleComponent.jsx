import React, { useState } from "react";
import SpiderChart from "./SpiderChart";
import BarChart from "../BarChart";
import PaginatedLapTable from "./PaginatedLapTable"; // adjust path if needed

const ToggleComponent = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedLap, setSelectedLap] = useState("");
  const [selectedView, setSelectedView] = useState("bar");
  const [selectedHorse, setSelectedHorse] = useState(null); //Changed!

  /* ↓ if the user taps the “Diagram / Tabell / Analys” button              */
  /*   we reset the one-horse filter so Spider shows everything again.       */
  const switchView = (view) => { //Changed!
    setSelectedView(view);       //Changed!
    if (view !== "spider") setSelectedHorse(null); //Changed!
  };                              //Changed!

  const callouts = [
    { id: 1, name: "Diagram", bgColor: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600", view: "bar" },
    { id: 2, name: "Tabell",  bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600", view: "table" },
    { id: 3, name: "Analys",  bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600", view: "spider" },
  ];

  return (
    <div className="text-center pt-12 pb-12 sm:pt-16 sm:pb-14">
      {/* Buttons */}
      <div className="flex justify-center gap-x-5 sm:gap-x-14 flex-wrap mb-5 sm:mb-8">
        {callouts.map((c) => (
          <div
            key={c.id}
            className="group relative cursor-pointer"
            onClick={() => switchView(c.view)}     /* Changed! */
          >
            <div
              className={`
                ${c.bgColor}
                relative h-14 w-24 sm:w-72 sm:h-18
                overflow-hidden rounded-md flex items-center justify-center
                transition-all duration-300 shadow-xl
                ${selectedView === c.view
                  ? "ring-2 ring-slate-400 scale-110 opacity-100 cursor-default"
                  : "hover:opacity-80"}
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
            selectedDate={selectedDate}           setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}         setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition} setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}             setSelectedLap={setSelectedLap}
            /* new → */ setSelectedView={setSelectedView} //Changed!
            setSelectedHorse={setSelectedHorse}           //Changed!
          />
        )}

        {selectedView === "spider" && (
          <SpiderChart
            /* existing props … */
            selectedDate={selectedDate}           setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}         setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition} setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}             setSelectedLap={setSelectedLap}
            /* new → */ selectedHorse={selectedHorse}     //Changed!
          />
        )}

        {selectedView === "table" && (
          <PaginatedLapTable
            selectedDate={selectedDate}           setSelectedDate={setSelectedDate}
            selectedTrack={selectedTrack}         setSelectedTrack={setSelectedTrack}
            selectedCompetition={selectedCompetition} setSelectedCompetition={setSelectedCompetition}
            selectedLap={selectedLap}             setSelectedLap={setSelectedLap}
          />
        )}
      </div>
    </div>
  );
};

export default ToggleComponent;
