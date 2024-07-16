import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const SpiderChart = () => {
  const [data, setData] = useState({
    labels: ['Value One', 'Value Two', 'Value Three', 'Value Four', 'Value Five'],
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datasetUrl, setDatasetUrl] = useState('http://localhost:8080/radar/find/all'); // Default URL

  useEffect(() => {
    setLoading(true);
    fetch(datasetUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
      })
      .then(fetchedData => {
        const radarData = fetchedData.map(horse => ({
          label: horse.name,
          data: [horse.valueOne, horse.valueTwo, horse.valueThree, horse.valueFour, horse.valueFive],
          borderColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 1)`,
          backgroundColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`,
        }));
        setData(previousData => ({
          ...previousData,
          datasets: radarData
        }));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.toString());
        setLoading(false);
      });
  }, [datasetUrl]); // Dependency array includes datasetUrl to re-fetch when it changes

  const options = {
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    elements: {
      line: {
        borderWidth: 3
      }
    }
  };

  const handleFetchFirstTen = () => {
    setDatasetUrl('http://localhost:8080/radar/find/all');
  };

  const handleFetchSecondTen = () => {
    setDatasetUrl('http://localhost:8080/radar/find/all2');
  };

  const handleFetchThirdTen = () => {
    setDatasetUrl('http://localhost:8080/radar/find/all3');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (data.datasets.length === 0) return <div>No data available.</div>;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-4"> 
        <br></br>
        <button onClick={handleFetchFirstTen} className="bg-blue-500 hover:bg-blue-700 text-sm font-semibold text-white py-2 px-4 rounded ml-4 m-4">
          4 Starter
        </button>
        <button onClick={handleFetchSecondTen} className="bg-indigo-500 hover:bg-indigo-700 text-sm font-semibold text-white py-2 px-4 rounded ml-4 m-4">
          8 Starter
        </button>
        <button onClick={handleFetchThirdTen} className="bg-orange-500 hover:bg-orange-700 text-sm font-semibold text-white py-2 px-4 rounded ml-4 m-4">
          12 Starter
        </button>
      </div>
      <div className="w-[600px] h-[600px]">
        <Radar data={data} options={options} />
      </div>
    </div>
  );
};

export default SpiderChart;
