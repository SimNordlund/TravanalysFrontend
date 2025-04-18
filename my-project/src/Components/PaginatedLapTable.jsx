import React, { useEffect, useState } from 'react';

const PaginatedLapTable = ({ competitionId, competitionName }) => {
  const [laps, setLaps] = useState([]);
  const [selectedLap, setSelectedLap] = useState(null);
  const [lapData, setLapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch lopp för tävling
  useEffect(() => {
    if (!competitionId) return;
    const fetchLaps = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/lap/findByCompetition?competitionId=${competitionId}`);
        const data = await response.json();
        setLaps(data);
        if (data.length > 0) setSelectedLap(data[0].id); // Väljer det första loppet yo
      } catch (err) {
        setError('Failed to fetch laps.');
      } finally {
        setLoading(false);
      }
    };
    fetchLaps();
  }, [competitionId]);

  // Fetch data för bestämda loppet
  useEffect(() => {
    if (!selectedLap) return;
    const fetchLapData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/completeHorse/findByLapAnalys?lapId=${selectedLap}`);
        const data = await response.json();
        setLapData(data);
      } catch (err) {
        setError('Failed to fetch lap data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLapData();
  }, [selectedLap]);

  const handleLapChange = (lapId) => {
    setSelectedLap(lapId);
  };

  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{competitionName}</h2>

      <div className="flex flex-wrap justify-start items-center mb-3 min-h-[50px] gap-1">
        {laps.length > 0 ? (
          laps.map((lap) => (
            <button
              key={lap.id}
              onClick={() => handleLapChange(lap.id)}
              disabled={loading}
              className={`px-3 py-2 rounded ${
                lap.id === selectedLap
                  ? 'bg-indigo-500 hover:bg-indigo-700 text-white font-semibold rounded shadow py-2 px-2 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out'
                  : 'bg-gray-200 text-gray-700 hover:bg-blue-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {lap.nameOfLap}
            </button>
          ))
        ) : (
          <div className="flex gap-2">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-300 rounded w-20 h-8 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      {/* Tabellen */}
      <div className="overflow-x-auto border border-gray-200 rounded relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
          </div>
        )}
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700 text-left border-b border-gray-200">
            <tr>
              <th className="py-2 px-2 font-semibold">#</th>
              <th className="py-2 px-2 font-semibold">Häst / Kusk</th>
              <th className="py-2 px-2 font-semibold">{competitionName}%</th>
              <th className="py-2 px-2 font-semibold">Trend%</th>
              <th className="py-2 px-2 font-semibold">V-Odds</th>
              <th className="py-2 px-2 font-semibold">Tränare</th>
              <th className="py-2 px-2 font-semibold">Tipskommentar</th>
              <th className="py-2 px-2 font-semibold">Skor</th>
              <th className="py-2 px-2 font-semibold">Vagn</th>
            </tr>
          </thead>
          <tbody>
            {lapData.map((row, index) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0 border-gray-200 hover:bg-gray-50"
              >
                <td className="py-2 px-2">{index + 1}</td>
                <td className="py-2 px-2">{row.nameOfCompleteHorse}</td>
                <td className="py-2 px-2">{row.fourStartsAnalys}</td>
                <td className="py-2 px-2">{row.trend}</td>
                <td className="py-2 px-2">{row.vOdds}</td>
                <td className="py-2 px-2">{row.trainer}</td>
                <td className="py-2 px-2">{row.tips}</td>
                <td className="py-2 px-2">{row.skor}</td>
                <td className="py-2 px-2">{row.vagn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaginatedLapTable;
