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

  const horseColors = [
    //  1. Blue
    'rgba(0, 0, 255, 0.5)',
    //  2. Orange
    'rgba(255, 165, 0, 0.5)',
    //  3. Red
    'rgba(255, 0, 0, 0.5)',
    //  4. Dark green
    'rgba(0, 100, 0, 0.5)',
    //  5. Light gray
    'rgba(211, 211, 211, 0.5)',
    //  6. Black
    'rgba(0, 0, 0, 0.5)',
    //  7. Yellow
    'rgba(255, 255, 0, 0.5)',
    //  8. Light blue
    'rgba(173, 216, 230, 0.5)',
    //  9. Brown
    'rgba(165, 42, 42, 0.5)',
    // 10. Dark blue
    'rgba(0, 0, 139, 0.5)',
    // 11. Dark yellow (Gold-ish)
    'rgba(204, 204, 0, 0.5)',
    // 12. Dark gray
    'rgba(105, 105, 105, 0.5)',
    // 13. Pink
    'rgba(255, 192, 203, 0.5)',
    // 14. Dark orange
    'rgba(255, 140, 0, 0.5)',
    // 15. Purple
    'rgba(128, 0, 128, 0.5)',
  ];
  

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
          const labels = completeHorses.map(horse => horse.nameOfCompleteHorse);
          const fourStartsPromises = completeHorses.map((horse, index) =>
            fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
              })
              .then(fourStartsData => {
                const colorIndex = index % horseColors.length;  // safe guard to wrap around if needed
                return {
                  label: horse.nameOfCompleteHorse,
                  data: Array(completeHorses.length).fill(null).map((_, idx) => 
                    idx === index ? fourStartsData.analys : null
                  ),
                  backgroundColor: horseColors[colorIndex],
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 0.5
                };
              })
          );

          return Promise.all(fourStartsPromises)
            .then(chartData => {
              setData({
                labels: labels,
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
  }, [selectedLap]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${1}`)
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
            .then(fourStartsData => {
              const colorIndex = index % horseColors.length;  // safe guard to wrap around if needed
              return {
                label: horse.nameOfCompleteHorse,
                data: Array(completeHorses.length).fill(null).map((_, idx) => 
                  idx === index ? fourStartsData.analys : null
                ),
                backgroundColor: horseColors[colorIndex],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 0.5
              };
            })
        );

        return Promise.all(datasets)
          .then(chartData => {
            setData({
              labels: chartData.map(dataset => dataset.label),
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
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      },
      x: {
        stacked: true,
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'right',
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
  };

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
    <div className="flex flex-col justify-center items-center mt-1 px-2">
      {/* Responsive Chart Container */}
      <div className="w-full h-[40vh] sm:h-[50vh] md:h-[50vh] relative">
        <Bar data={data} options={options} />
      </div>

      {/* Dropdowns */}
      <div className="flex flex-col items-center space-y-4 mt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <select value={selectedDate} onChange={handleDateChange} className="hover:bg-slate-50 p-2 border rounded">
          <option value="" disabled>Välj datum</option>
          {dates.map(date => (
            <option key={date.id} value={date.date}>{date.date}</option>
          ))}
        </select>
        <select value={selectedTrack} onChange={handleTrackChange} className="hover:bg-slate-50 p-2 border rounded">
          <option value="" disabled>Välj bana</option>
          {tracks.map(track => (
            <option key={track.id} value={track.id}>{track.nameOfTrack}</option>
          ))}
        </select>
        <select value={selectedCompetition} onChange={handleCompetitionChange} className="hover:bg-slate-50 p-2 border rounded">
          <option value="" disabled>Välj spelform</option>
          {competitions.map(competition => (
            <option key={competition.id} value={competition.id}>{competition.nameOfCompetition}</option>
          ))}
        </select>
        <select value={selectedLap} onChange={handleLapChange} className="hover:bg-slate-50 p-2 border rounded">
          <option value="" disabled>Välj lopp</option>
          {laps.map(lap => (
            <option key={lap.id} value={lap.id}>{lap.nameOfLap}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BarChartComponent;
