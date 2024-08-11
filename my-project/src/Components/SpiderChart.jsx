import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const SpiderChart = () => {
    const [data, setData] = useState({
        labels: ['Analys', 'Fart', 'Styrka', 'Klass', 'Prispengar', 'Kusk', 'Spår'],
        datasets: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('');
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [selectedLap, setSelectedLap] = useState(''); // State for selected lap

    const [dates, setDates] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [laps, setLaps] = useState([]);

    // Fetch available dates
    useEffect(() => {
        fetch('http://localhost:8080/track/dates')
            .then(response => response.json())
            .then(data => setDates(data))
            .catch(error => console.error('Error fetching dates:', error));
    }, []);

    // Fetch tracks based on selected date
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

    // Fetch competitions based on selected track
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

    // Fetch laps based on selected competition
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

    // Initial fetch for a default lap (e.g., lapId=2)
    useEffect(() => {
        setLoading(true);
        fetch(`http://localhost:8080/completeHorse/findByLap?lapId=${2}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                return response.json();
            })
            .then(completeHorses => {
                const fourStartsPromises = completeHorses.map(horse => 
                    fetch(`http://localhost:8080/fourStarts/findData?completeHorseId=${horse.id}`)
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
                                fourStartsData.kusk,
                                fourStartsData.spar
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
    }, []); // This runs once when the component mounts

    // Fetch data when a lap is selected by the user
    useEffect(() => {
        if (selectedLap) {
            setLoading(true);
            fetch(`http://localhost:8080/completeHorse/findByLap?lapId=${selectedLap}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
                    return response.json();
                })
                .then(completeHorses => {
                    const fourStartsPromises = completeHorses.map(horse => 
                        fetch(`http://localhost:8080/fourStarts/findData?completeHorseId=${horse.id}`)
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
                                    fourStartsData.kusk,
                                    fourStartsData.spar
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
    }, [selectedLap]); // This runs whenever a lap is selected by the user

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
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex justify-center items-start mt-1">
                {/* Dropdowns */}
                <div className="mr-8 flex flex-col space-y-4 mt-24 ">
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

                {/* Radar Chart */}
                <div className="w-[600px] h-[600px] flex items-center justify-center">
                    <Radar data={data} options={{ scales: { r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 100 } }, elements: { line: { borderWidth: 3 } } }} />
                    {loading && <div>Loading...</div>}
                </div>
            </div>
        </div>
    );
};

export default SpiderChart;