import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import pappaCrazy from "./Bilder/PappaCrazy.png";
import Chart from "chart.js/auto";

const BarChartComponent = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState([]);

  const [selectedTrack, setSelectedTrack] = useState("");
  const [tracks, setTracks] = useState([]);

  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [competitions, setCompetitions] = useState([]);

  const [selectedLap, setSelectedLap] = useState("1");
  const [laps, setLaps] = useState([]);

  // Our color palette for the horses
  const horseColors = [
    "rgba(0, 0, 255, 0.5)",
    "rgba(255, 165, 0, 0.5)",
    "rgba(255, 0, 0, 0.5)",
    "rgba(0, 100, 0, 0.5)",
    "rgba(211, 211, 211, 0.5)",
    "rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)",
    "rgba(173, 216, 230, 0.5)",
    "rgba(165, 42, 42, 0.5)",
    "rgba(0, 0, 139, 0.5)",
    "rgba(204, 204, 0, 0.5)",
    "rgba(105, 105, 105, 0.5)",
    "rgba(255, 192, 203, 0.5)",
    "rgba(255, 140, 0, 0.5)",
    "rgba(128, 0, 128, 0.5)",
  ];

  // --- Dynamic Legend Position ---
  const [legendPosition, setLegendPosition] = useState("right");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        //640 egenltigen
        setLegendPosition("top");
      } else {
        setLegendPosition("right");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Run once on mount

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // ------------------------------

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((response) => response.json())
      .then((data) => {
        setDates(data);
        //Changed! Automatically set the first date as selected:
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        }
      })
      .catch((error) => console.error("Error fetching dates:", error));
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetch(`${API_BASE_URL}/track/locations/byDate?date=${selectedDate}`)
        .then((response) => response.json())
        .then((data) => {
          setTracks(data);
          if (data.length > 0) {
            setSelectedTrack(data[0].id);
          }
        })
        .catch((error) => console.error("Error fetching tracks:", error));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTrack) {
      fetch(`${API_BASE_URL}/competition/findByTrack?trackId=${selectedTrack}`)
        .then((response) => response.json())
        .then((data) => {
          setCompetitions(data);
          if (data.length > 0) {
            setSelectedCompetition(data[0].id);
          }
        })
        .catch((error) => console.error("Error fetching competitions:", error));
    } else {
      setCompetitions([]);
    }
  }, [selectedTrack]);

  useEffect(() => {
    if (selectedCompetition) {
      fetch(
        `${API_BASE_URL}/lap/findByCompetition?competitionId=${selectedCompetition}`
      )
        .then((response) => response.json())
        .then((data) => {
          setLaps(data);
          if (data.length > 0) {
            setSelectedLap(data[0].id); // Auto-select first lap //Changed!
          }
        })
        .catch((error) => {
          console.error("Error fetching laps:", error);
          setLaps([]);
        });
    }
  }, [selectedCompetition]);

  useEffect(() => {
    if (selectedLap) {
      setLoading(true);
      fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok: " + response.statusText
            );
          }
          return response.json();
        })
        .then((completeHorses) => {
          const labels = completeHorses.map(
            (_, index) => `${index + 1}.`
          );
          const fourStartsPromises = completeHorses.map((horse, index) =>
            fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`
            )
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    "Network response was not ok: " + response.statusText
                  );
                }
                return response.json();
              })
              .then((fourStartsData) => {
                const colorIndex = index % horseColors.length;
                return {
                  label: horse.nameOfCompleteHorse,
                  data: Array(completeHorses.length)
                    .fill(null)
                    .map((_, idx) =>
                      idx === index ? fourStartsData.analys : null
                    ),
                  backgroundColor: horseColors[colorIndex],
                  borderColor: "rgba(0, 0, 0, 1)",
                  borderWidth: 0.5,
                };
              })
          );

          return Promise.all(fourStartsPromises).then((chartData) => {
            setData({
              labels: labels,
              datasets: chartData,
            });
            setLoading(false);
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setError(error.toString());
          setLoading(false);
        });
    }
  }, [selectedLap]);

  // --- Chart.js Options ---
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        minBarLength: 10, // Set a minimum bar length (e.g., 5 pixels)
      },
      x: {
        stacked: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: legendPosition,
        onClick: (e, legendItem) => {
          const ci = legendItem.chart;
          const index = legendItem.datasetIndex;
          ci.getDatasetMeta(index).hidden = !ci.getDatasetMeta(index).hidden;
          ci.update();
        },
      },
    },
  };

  // --- Helpers to derive "labels" ---
  const selectedDateLabel = selectedDate || "Idag";
  const selectedTrackLabel = selectedTrack
    ? tracks.find((track) => track.id === +selectedTrack)?.nameOfTrack ?? ""
    : "Färjestad";
  const selectedCompetitionLabel = selectedCompetition
    ? competitions.find((c) => c.id === +selectedCompetition)
        ?.nameOfCompetition ?? ""
    : "v75";
  const selectedLapLabel = selectedLap
    ? laps.find((l) => l.id === +selectedLap)?.nameOfLap ?? ""
    : "Lopp 1";

  // --- Event Handlers ---
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleTrackChange = (event) => {
    setSelectedTrack(event.target.value);
  };

  const handleCompetitionChange = (event) => {
    setSelectedCompetition(event.target.value);
  };

  const handleLapChange = (event) => {
    setSelectedLap(event.target.value);
  };

  // --- Rendering ---
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="block text-center mb-4">Grubblar...</div>
        <img
          className="h-24 w-24 rounded-full animate-spin"
          src={pappaCrazy}
          alt="Loading animation"
        />
      </div>
    );

  if (error) return <div>Error: {error}</div>;
  if (!data.datasets.length) return <div>No data available.</div>;

  return (
    <div className="flex flex-col mt-1 px-2 pb-10">
      {/* Your new dynamic text */}
      <p
        className="sm:text-xl text-lg font-semibold text-slate-700 mt-4 mb-4 sm:mt-2 sm:mb-2 
       px-4 py-2 flex flex-col justify-center items-center"
      >
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}{" "}
        
        <hr className="w-full border-t-2 border-gray-200" />
      </p>
      <div className="flex flex-wrap justify-start items-center gap-1 mb-4">
        {laps.length > 0 ? (
          laps.map((lap) => (
            <button
              key={lap.id}
              onClick={() => setSelectedLap(lap.id)} //Changed!
              disabled={loading}
              className={`px-3 py-2 rounded ${
                lap.id === +selectedLap
                  ? "bg-indigo-500 hover:bg-indigo-700 text-white font-semibold shadow focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-200"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
      <div className="w-full flex justify-center">
        {" "}
        {/* NEW wrapper to center it */}
        <div className="sm:w-[90vh] w-[40vh] sm:h-[45vh] h-[40vh] relative">
          <Bar data={data} options={options} />
        </div>
      </div>

      {/* Dropdowns */}
      <div className="w-full flex justify-center">
        {" "}
        {/* NEW wrapper to center */}
        <div className="flex flex-col justify-center items-center w-full sm:w-[50%] space-y-4 mt-8 sm:mt-4 sm:flex-row sm:space-y-0 sm:space-x-2 border-spacing-x-80 bg-slate-50 sm:p-4 rounded-xl border shadow-md">
          <select
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg"
          >
            <option value="" disabled>
              Välj datum
            </option>
            {dates.map((date) => (
              <option key={date.id} value={date.date}>
                {date.date}
              </option>
            ))}
          </select>

          <select
            value={selectedTrack}
            onChange={handleTrackChange}
            className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg"
          >
            <option value="" disabled>
              Välj bana
            </option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.nameOfTrack}
              </option>
            ))}
          </select>

          <select
            value={selectedCompetition}
            onChange={handleCompetitionChange}
            className="w-full sm:w-auto hover:bg-slate-50 p-2 border rounded-lg"
          >
            <option value="" disabled>
              Välj spelform
            </option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.nameOfCompetition}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default BarChartComponent;
