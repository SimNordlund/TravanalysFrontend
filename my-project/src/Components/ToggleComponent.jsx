import React, { useState } from "react";
import SpiderChart from "./SpiderChart";
import BarChart from "../BarChart";
import PaginatedLapTable from "./PaginatedLapTable"; // Adjust path if needed

const ToggleComponent = () => {
  const [selectedView, setSelectedView] = useState("bar");

  const callouts = [
    {
      id: 1,
      name: "Diagram",
      bgColor: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600",
      view: "bar",
    },
    {
      id: 2,
      name: "Tabeller",
      bgColor: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600",
      view: "table",
    },
    {
      id: 3,
      name: "Analys",
      bgColor: "bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600",
      view: "spider",
    },
  ];

  return (
    <div className="text-center pt-8 pb-12 sm:pt-12 sm:pb-14">
      {/* Buttons */}
      <div className="flex justify-center gap-x-5 sm:gap-x-7 flex-wrap mb-5 sm:mb-8">
        {callouts.map((callout) => (
          <div
            key={callout.id}
            className="group relative cursor-pointer"
            onClick={() => setSelectedView(callout.view)}
          >
            <div
              className={`
              ${callout.bgColor} 
               relative h-14 w-24 sm:w-72 sm:h-18 
               overflow-hidden rounded-md flex items-center justify-center 
               transition-all duration-300 shadow-xl
              ${
                selectedView === callout.view
                  ? "ring-2 ring-slate-400 scale-110 opacity-100 cursor-default"
                  : "hover:opacity-80 cursor-pointer"
              }`}
            >
              <h3 className="sm:text-2xl font-semibold text-white text-center">
                {callout.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart/Table Toggle Display */}
      <div className="sm:max-w-4xl sm:mx-auto bg-white ml-4 mr-4 sm:pl-8 sm:pr-8 sm:pb-2 rounded-xl shadow-lg">
        <div className="relative w-auto h-auto">
          {selectedView === "bar" && <BarChart />}
          {selectedView === "spider" && <SpiderChart />}
          {selectedView === "table" && (
            <PaginatedLapTable
              competitionId={"1"} // Replace with dynamic ID if needed
              competitionName={"V75"} // Replace as needed
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
