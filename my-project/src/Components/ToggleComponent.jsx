import React, { useState } from 'react';
import SpiderChart from './SpiderChart';
import BarChart from '../BarChart'; // Ensure the path is correc

const ToggleComponent = () => {
  const [showSpiderChart, setShowSpiderChart] = useState(true);

  return (
    <div className="text-center pb-32">
      <button 
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
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
