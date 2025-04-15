import React, { useState } from 'react';
import SpiderChart from './SpiderChart';
import BarChart from '../BarChart';
import PaginatedLapTable from './PaginatedLapTable'; // Adjust path if needed

const ToggleComponent = () => {
  const [selectedView, setSelectedView] = useState('bar');

  const callouts = [
    {
      id: 1,
      name: 'Diagram',
      bgColor: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
      view: 'bar',
    },
    {
      id: 2,
      name: 'Tabeller',
      bgColor: 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600',
      view: 'table',
    },
    {
      id: 3,
      name: 'Analys',
      bgColor: 'bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600',
      view: 'spider',
    },
  ];

  return (
    <div className="text-center mt-10 mb-10 sm:mt-12 sm:pb-32 pb-4">
      {/* Buttons */}
      <div className="flex justify-center gap-x-6 flex-wrap mb-10">
        {callouts.map((callout) => (
          <div
            key={callout.id}
            className="group relative cursor-pointer"
            onClick={() => setSelectedView(callout.view)}
          >
            <div
              className={`${callout.bgColor} relative h-24 w-24 sm:w-72 sm:h-28 overflow-hidden rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity duration-300 shadow-xl`}
            >
              <h3 className="sm:text-3xl font-semibold text-white text-center">
                {callout.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart/Table Toggle Display */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative w-full h-auto sm:h-[40vh] md:h-[50vh]">
          {selectedView === 'bar' && <BarChart />}
          {selectedView === 'spider' && <SpiderChart />}
          {selectedView === 'table' && (
            <PaginatedLapTable
              competitionId={'1'} // Replace with dynamic ID if needed
              competitionName={'Min Tävling'} // Replace as needed
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
