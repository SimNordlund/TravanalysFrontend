import React, { useState } from 'react';
import SpiderChart from './SpiderChart';
import BarChart from '../BarChart'; // Ensure the path is correct

const ToggleComponent = () => {
  const [showSpiderChart, setShowSpiderChart] = useState(true);

  return (
    <div className="text-center mt-10 mb-10 sm:mt-12 sm:pb-32 pb-4">
      <button
        className={`bg-gradient-to-r ${
          showSpiderChart
            ? 'from-indigo-400 via-indigo-500 to-indigo-600'
            : 'from-purple-400 via-purple-500 to-purple-600'
        } text-white font-semibold rounded-lg shadow-xl px-6 py-3 sm:px-8 sm:py-4 hover:opacity-90 transition-transform duration-300 ease-in-out transform hover:scale-105`}
        onClick={() => setShowSpiderChart(!showSpiderChart)}
      >
        {showSpiderChart ? 'Byt till spindeldiagram' : 'Byt till vanligt diagram'}
      </button>
      <div className="w-full max-w-4xl mx-auto mt-8">
        {/* Responsive container for the chart */}
        <div className="relative w-full h-auto sm:h-[40vh] md:h-[50vh]">
          {showSpiderChart ? <BarChart /> : <SpiderChart />}
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
