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
    const [datasetUrl, setDatasetUrl] = useState('http://localhost:8080/radar/find/all');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('');
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [dates, setDates] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [competitions, setCompetitions] = useState([]);
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
        setLoading(true);
        fetch(datasetUrl)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
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
    }, [datasetUrl]);

    const handleDateChange = event => {
        setSelectedDate(event.target.value);
    };

    const handleTrackChange = event => {
        setSelectedTrack(event.target.value);
    };

    const handleCompetitionChange = event => {
        setSelectedCompetition(event.target.value);
    };

    if (error) return <div>Error: {error}</div>;
    if (data.datasets.length === 0 && !loading) return <div>No data available.</div>;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="text-center mb-4">
                <select value={selectedDate} onChange={handleDateChange} className="hover:bg-slate-50 ml-4 mt-4 p-2 border rounded">
                    <option value="" disabled>Select a date</option>
                    {dates.map(date => (
                        <option key={date.id} value={date.date}>{date.date}</option>
                    ))}
                </select>
                <select value={selectedTrack} onChange={handleTrackChange} className="hover:bg-slate-50 ml-4 mt-4 p-2 border rounded">
                    <option value="" disabled>Select a track</option>
                    {tracks.map(track => (
                        <option key={track.id} value={track.id}>{track.nameOfTrack}</option>
                    ))}
                </select>
                <select value={selectedCompetition} onChange={handleCompetitionChange} className="hover:bg-slate-50 ml-4 mt-4 p-2 border rounded">
                    <option value="" disabled>Select a competition</option>
                    {competitions.map(competition => (
                        <option key={competition.id} value={competition.id}>{competition.nameOfCompetition}</option>
                    ))}
                </select>
                <select className="hover:bg-slate-50 ml-4 mt-4 p-2 border rounded">
                    <option value="" disabled>Select a lap</option>
                    {laps.map(lap => (
                        <option key={lap.id} value={lap.id}>{lap.nameOfLap}</option>
                    ))}
                </select>
            </div>
            <div className="w-[600px] h-[600px] flex items-center justify-center">
                {loading ? <div>Loading...</div> : <Radar data={data} options={{ scales: { r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 100 } }, elements: { line: { borderWidth: 3 } } }} />}
            </div>
        </div>
    );
};

export default SpiderChart;
