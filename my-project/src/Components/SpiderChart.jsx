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
  const [selectedDate, setSelectedDate] = useState('');

  const dates = [
    { label: '2024-01-01', url: 'http://localhost:8080/radar/find/date1' },
    { label: '2024-02-01', url: 'http://localhost:8080/radar/find/date2' },
    { label: '2024-03-01', url: 'http://localhost:8080/radar/find/date3' }
  ];
  

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

  const handleDateChange = (event) => {
    const selectedUrl = dates.find(date => date.label === event.target.value)?.url;
    if (selectedUrl) {
      setDatasetUrl(selectedUrl);
      setSelectedDate(event.target.value);
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (data.datasets.length === 0 && !loading) return <div>No data available.</div>;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-4"> 
        <br />
        <button onClick={handleFetchFirstTen} className="bg-blue-500 hover:bg-blue-700 text-sm font-semibold text-white py-2 px-4 rounded ml-4 m-4">
          4 Starter
        </button>
        <button onClick={handleFetchSecondTen} className="bg-indigo-500 hover:bg-indigo-700 text-sm font-semibold text-white py-2 px-4 rounded ml-4 m-4">
          8 Starter
        </button>
        <button onClick={handleFetchThirdTen} className="bg-orange-400 hover:bg-orange-700 text-sm font-semibold text-white py-2 px-4 rounded ml-4 m-4">
          12 Starter
        </button>
        <select value={selectedDate} onChange={handleDateChange} className="hover:bg-slate-50 ml-4 mt-4 p-2 border rounded">
          <option value="" disabled>Välj ett datum</option>
          {dates.map(date => (
            <option key={date.label} value={date.label}>
              {date.label}
            </option>
          ))}
        </select>
        <select value={selectedDate} onChange={handleDateChange} className="hover:bg-slate-50 ml-4 mt-4 p-2 border rounded">
          <option value="" disabled>Välj en bana</option>
          {dates.map(date => (
            <option key={date.label} value={date.label}>
              {date.label}
            </option>
          ))}
        </select>
        <select value={selectedDate} onChange={handleDateChange} className="hover:bg-slate-50 ml-4 mt-4 p-2 border rounded">
          <option value="" disabled>Välj ett lopp</option>
          {dates.map(date => (
            <option key={date.label} value={date.label}>
              {date.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-[600px] h-[600px] flex items-center justify-center">
        {loading ? (
          <div className="w-[600px] h-[600px] flex items-center justify-center">
            <div>Loading...</div>
          </div>
        ) : (
          <Radar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default SpiderChart;
