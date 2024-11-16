import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const BarChartComponent = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [dates, setDates] = useState([]);

  const [selectedTrack, setSelectedTrack] = useState(''); 
  const [tracks, setTracks] = useState([]);

  const [selectedCompetition, setSelectedCompetition] = useState(''); 
  const [competitions, setCompetitions] = useState([]); 

  const [selectedLap, setSelectedLap] = useState('');
  const [laps, setLaps] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
        .then(response => response.json())
        .then(data => setDates(data))
        .catch(error => console.error('Error fetching dates:', error));
}, []);

useEffect(() => {
  if (selectedDate) {
      fetch(`${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`)
          .then(response => response.json())
          .then(data => {
              setTracks(data);
              setSelectedTrack('');
          })
          .catch(error => console.error('Error fetching tracks:', error));
  }
}, [selectedDate]);

useEffect(() => {
  if (selectedTrack) {
      fetch(`${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`)
          .then(response => response.json())
          .then(data => {
              setCompetitions(data);
              setSelectedCompetition('');
          })
          .catch(error => console.error('Error fetching competitions:', error));
  } else {
      setCompetitions([]);
  }
}, [selectedTrack]);

useEffect(() => {
  if (selectedCompetition) {
      fetch(`${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`)
          .then(response => response.json())
          .then(data => setLaps(data))
          .catch(error => {
              console.error('Error fetching laps:', error);
              setLaps([]);
          });
  } else {
      setLaps([]);
  }
}, [selectedCompetition]);

useEffect(() => {
  if (selectedLap) {
    setLoading(true);
    fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
      })
      .then(completeHorses => {
        const labels = completeHorses.map(horse => horse.nameOfCompleteHorse); // Properly define labels within the same .then block where it's used
        const fourStartsPromises = completeHorses.map((horse, index) =>
          fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
              }
              return response.json();
            })
            .then(fourStartsData => ({
              label: horse.nameOfCompleteHorse,
              data: Array(completeHorses.length).fill(null).map((_, idx) => idx === index ? fourStartsData.analys : null), // Ensure only 'analys' is plotted at the correct index
              backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
              borderColor: 'rgba(0, 0, 0, 1)', // Black border for all bars
              borderWidth: 0.5
            }))
        );

        return Promise.all(fourStartsPromises)
          .then(chartData => {
            setData({
              labels: labels, // Use labels array here
              datasets: chartData
            });
            setLoading(false);
          });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.toString());
        setLoading(false);
      });
  }
}, [selectedLap]); // Include selectedLap in the dependency array to ensure useEffect is called when it changes


useEffect(() => {
  setLoading(true);
  fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${1}`) // Assuming lapId is hardcoded to 1
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(completeHorses => {
      const labels = completeHorses.map(horse => horse.nameOfCompleteHorse);
      const datasets = completeHorses.map((horse, index) => 
        fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
          })
          .then(fourStartsData => ({
            label: horse.nameOfCompleteHorse,
            data: Array(completeHorses.length).fill(null).map((_, idx) => idx === index ? fourStartsData.analys : null), // Put the value at its corresponding label
            backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
            borderColor: 'rgba(0, 0, 0, 1)', // Black border for all bars
            borderWidth: 0.5
          }))
      );

      return Promise.all(datasets);
    })
    .then(chartData => {
      setData({
        labels: chartData.map(dataset => dataset.label), // Labels are the names of the horses
        datasets: chartData
      });
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setError(error.toString());
      setLoading(false);
    });
}, []); // Empty dependency array to run only once on component mount



  const options = {
    scales: {
      y: {
        beginAtZero: true
      },
      x: {
        stacked: true,
      }
    },
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        onClick: (e, legendItem) => {
          const ci = legendItem.chart;
          const index = legendItem.datasetIndex;

          ci.getDatasetMeta(index).hidden = !ci.getDatasetMeta(index).hidden;
          ci.update();
        },
      }
    },
  };

  const handleDateChange = event => {
    setSelectedDate(event.target.value);
};

  const handleTrackChange = event => {
    setSelectedTrack(event.target.value);
  }

  const handleCompetitionChange = event => {
    setSelectedCompetition(event.target.value);
};

const handleLapChange = event => {
  setSelectedLap(event.target.value);
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.datasets.length) return <div>No data available.</div>;

  return (

    
    <div className="flex flex-col justify-center items-center mt-1">
    {/* Chart Container */}
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]" style={{ height: '50vh' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
      {/* Dropdowns */}
      <div className="flex flex-wrap justify-center space-x-4 mt-4">
        <select value={selectedDate} onChange={handleDateChange} className="hover:bg-slate-50 p-2 border rounded">
          <option value="" disabled>Select a date</option>
          {dates.map(date => (
            <option key={date.id} value={date.date}>{date.date}</option>
          ))}
        </select>
        <select value={selectedTrack} onChange={handleTrackChange} className="hover:bg-slate-50 p-2 border rounded">
            <option value="" disabled>Select a track</option>
                {tracks.map(track => (
            <option key={track.id} value={track.id}>{track.nameOfTrack}</option>
               ))}
        </select>
        <select value={selectedCompetition} onChange={handleCompetitionChange} className="hover:bg-slate-50 p-2 border rounded">
                        <option value="" disabled>Select a competition</option>
                        {competitions.map(competition => (
                            <option key={competition.id} value={competition.id}>{competition.nameOfCompetition}</option>
                        ))}
        </select>
        <select value={selectedLap} onChange={handleLapChange} className="hover:bg-slate-50 p-2 border rounded">
                        <option value="" disabled>Select a lap</option>
                        {laps.map(lap => (
                            <option key={lap.id} value={lap.id}>{lap.nameOfLap}</option>
                        ))}
                    </select>
      </div>
  


    </div>
  );
};

export default BarChartComponent;
