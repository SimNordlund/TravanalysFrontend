import React, { useState } from 'react';
import SpiderChart from './SpiderChart'; // Ensure the path is correct
import BarChart from '../BarChart'; // Ensure the path is correct

const ToggleComponent = () => {
  const [showSpiderChart, setShowSpiderChart] = useState(true); // Toggle state

  return (
    <div className="text-center">
      <button 
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
        onClick={() => setShowSpiderChart(!showSpiderChart)}
      >
        {showSpiderChart ? 'Switch to Bar Chart' : 'Switch to Spider Chart'}
      </button>
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="relative w-full h-[600px]">
          {showSpiderChart ? <BarChart /> : <SpiderChart />}
        </div>
      </div>
    </div>
  );
};

export default ToggleComponent;
