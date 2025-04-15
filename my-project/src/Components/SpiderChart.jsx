import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const SpiderChart = () => {
    const [data, setData] = useState({
        labels: ['Analys', 'Fart', 'Styrka', 'Klass', 'Prispengar', 'Kusk'],
        datasets: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('');
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [selectedLap, setSelectedLap] = useState('');

    const [dates, setDates] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [competitions, setCompetitions] = useState([]);
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

    // Initial fetch for default lap (e.g. lapId=2)
    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${2}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then(completeHorses => {
                const fourStartsPromises = completeHorses.map(horse => 
                    fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
                        .then(response => {
                            if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
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
                                fourStartsData.kusk
                            ],
                            backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
                        }))
                );
    
                return Promise.all(fourStartsPromises);
            })
            .then(radarData => {
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
    }, []);

    // Fetch data when a lap is selected by the user
    useEffect(() => {
        if (selectedLap) {
            setLoading(true);
            fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                    return response.json();
                })
                .then(completeHorses => {
                    const fourStartsPromises = completeHorses.map(horse => 
                        fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`)
                            .then(response => {
                                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
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
                                    fourStartsData.kusk
                                ],
                                backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
                            }))
                    );
        
                    return Promise.all(fourStartsPromises);
                })
                .then(radarData => {
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
        }
    }, [selectedLap]);

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

    if (error) return <div>Error: {error}</div>;
    if (data.datasets.length === 0 && !loading) return <div>No data available.</div>;

    return (
        <div className="flex flex-col justify-center items-center mt-1 px-2 pb-10">
                {/* Radar Chart */}
             <div className="relative w-full sm:w-[300px] md:w-[500px] h-[60vh] sm:h-[40vh] md:h-[50vh] flex items-center justify-center">
                    <Radar 
                      data={data} 
                      options={{ 
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { 
                          r: { 
                            angleLines: { display: false }, 
                            suggestedMin: 0, 
                            suggestedMax: 100 
                          } 
                        }, 
                        elements: { line: { borderWidth: 3 } } 
                      }} 
                    />
                    {loading && <div>Loading...</div>}
            </div>
            <div className="flex flex-col w-full sm:w-auto space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 border-spacing-x-80 bg-slate-50 sm:p-4 rounded-xl border shadow-md">
                {/* Dropdowns */}
                    <select value={selectedDate} onChange={handleDateChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
                        <option value="" disabled>Välj datum</option>
                        {dates.map(date => (
                            <option key={date.id} value={date.date}>{date.date}</option>
                        ))}
                    </select>
                    <select value={selectedTrack} onChange={handleTrackChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
                        <option value="" disabled>Välj bana</option>
                        {tracks.map(track => (
                            <option key={track.id} value={track.id}>{track.nameOfTrack}</option>
                        ))}
                    </select>
                    <select value={selectedCompetition} onChange={handleCompetitionChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
                        <option value="" disabled>Välj spelform</option>
                        {competitions.map(competition => (
                            <option key={competition.id} value={competition.id}>{competition.nameOfCompetition}</option>
                        ))}
                    </select>
                    <select value={selectedLap} onChange={handleLapChange} className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg">
                        <option value="" disabled>Välj lopp</option>
                        {laps.map(lap => (
                            <option key={lap.id} value={lap.id}>{lap.nameOfLap}</option>
                        ))}
                    </select>
            </div>
        </div>
    );
};

export default SpiderChart;
