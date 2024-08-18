import React, { useState } from 'react';
import SpiderChart from './SpiderChart'; // Correct the import paths as necessary
import BarChart from '../BarChart'; // Correct the import paths as necessary

const ToggleComponent = () => {
  const [showSpiderChart, setShowSpiderChart] = useState(true); // Toggle state

  return (
    <div className="text-center">
      <button 
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out mb-10"
        onClick={() => setShowSpiderChart(!showSpiderChart)}
      >
        {showSpiderChart ? 'Switch to Bar Chart' : 'Switch to Spider Chart'}
      </button>
      <div>
        {showSpiderChart ? <SpiderChart /> : <BarChart />}
      </div>
    </div>
  );
};

export default ToggleComponent;
