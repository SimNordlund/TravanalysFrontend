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

  useEffect(() => {
    fetch('http://localhost:8080/track/dates')
        .then(response => response.json())
        .then(data => setDates(data))
        .catch(error => console.error('Error fetching dates:', error));
}, []);

useEffect(() => {
  if (selectedDate) {
      fetch(`http://localhost:8080/track/locations/byDate?date=${selectedDate}`)
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
      fetch(`http://localhost:8080/competition/findByTrack?trackId=${selectedTrack}`)
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
      fetch(`http://localhost:8080/lap/findByCompetition?competitionId=${selectedCompetition}`)
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
    fetch(`http://localhost:8080/completeHorse/findByLap?lapId=${selectedLap}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
      })
      .then(completeHorses => {
        const fourStartsPromises = completeHorses.map(horse => 
          fetch(`http://localhost:8080/fourStarts/findData?completeHorseId=${horse.id}`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
              }
              return response.json();
            })
            .then(fourStartsData => ({
              label: horse.nameOfCompleteHorse,
              data: [
                fourStartsData.analys,
                fourStartsData.fart,
                fourStartsData.styrka,
                fourStartsData.klass,
                fourStartsData.prispengar,
                fourStartsData.kusk,
                fourStartsData.spar
              ],
              backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
            }))
        );

        return Promise.all(fourStartsPromises);
      })
      .then(radarData => {
        setData({
          labels: radarData.map(dataset => dataset.label), // Assuming you want the labels to be the names of complete horses
          datasets: radarData
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.toString());
        setLoading(false);
      });
  }
}, [selectedLap]); // This runs whenever a lap is selected by the user

useEffect(() => {
  setLoading(true);
  fetch(`http://localhost:8080/completeHorse/findByLap?lapId=${2}`) // Hardcoded to lapId = 2
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(completeHorses => {
      const fourStartsPromises = completeHorses.map(horse => 
        fetch(`http://localhost:8080/fourStarts/findData?completeHorseId=${horse.id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
          })
          .then(fourStartsData => ({
            label: horse.nameOfCompleteHorse,
            data: [
              fourStartsData.analys,
              fourStartsData.fart,
              fourStartsData.styrka,
              fourStartsData.klass,
              fourStartsData.prispengar,
              fourStartsData.kusk,
              fourStartsData.spar
            ],
            backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
          }))
      );

      return Promise.all(fourStartsPromises);
    })
    .then(radarData => {
      setData({
        labels: radarData.map(dataset => dataset.label), // Assuming you want the labels to be the names of complete horses
        datasets: radarData
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
    <div className="flex justify-center items-start mt-1">
      {/* Dropdowns */}
      <div className="mr-8 flex flex-col space-y-4 mt-24">
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
  
      <div className="w-[600px] h-[550px] flex items-center justify-center">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarChartComponent;
