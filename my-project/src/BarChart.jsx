import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import pappaCrazy from "./Bilder/PappaCrazy.png";
import Chart from "chart.js/auto";

const BarChartComponent = () => {
  const legendRef = useRef(null);
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
  const [isSmallScreen, setIsSmallScreen] = useState(
    // Changed!
    window.innerWidth < 640 // Changed!
  ); // Changed!

  useEffect(() => {
    // Changed!
    const onResize = () => setIsSmallScreen(window.innerWidth < 640); // Changed!
    window.addEventListener("resize", onResize); // Changed!
    return () => window.removeEventListener("resize", onResize); // Changed!
  }, []); // Changed!

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((response) => response.json())
      .then((data) => {
        setDates(data);
        const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
        const todayDate = data.find((d) => d.date === todayStr);
        if (todayDate) {
          setSelectedDate(todayDate.date); //Changed!
        } else if (data.length > 0) {
          setSelectedDate(data[0].date); // fallback to earliest
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
          const labels = completeHorses.map((_, index) => `${index + 1}.`);
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
                  label: `${index + 1}. ${horse.nameOfCompleteHorse}`,
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
        ticks: {
          //Changed!
          autoSkip: false, //Changed!  ← show every label
          maxRotation: 0, //Changed!  ← keep them horizontal
          padding: 2, //Changed!  ← a little breathing room
          // You can also shrink the font if you want:
          // font: { size: 10 },
        },
      },
    },
    plugins: {
      legend: {
        // Changed!
        display: !isSmallScreen, // Changed!
        position: isSmallScreen ? "top" : "right", // Changed!
        align: "start", // Changed! (rows start at x 0)
        labels: {
          // Changed!
          boxWidth: 42, // ← default is 40 — make it 50, 60, etc.
          // boxHeight: 16,            // optional – leave out to keep it square
          // padding: 9,              // optional – gap between box and text
          // If you’re using dots instead of squares:
          // usePointStyle: true,
          // pointStyleWidth: 30,
        },
      },
    },
  };

  // --- Helpers to derive "labels" ---

  // Changed! – put this just above your existing helpers / options
  const htmlLegendPlugin = {
    id: "htmlLegend",
    afterUpdate(chart) {
      const ul = legendRef.current;
      if (!ul) return;

      // empty it
      while (ul.firstChild) ul.firstChild.remove();

      // build <li> elements
      chart.legend.legendItems.forEach((item) => {
        const li = document.createElement("li");
        li.className = "flex items-center cursor-pointer";
        li.style.opacity = item.hidden ? 0.5 : 1;

        li.onclick = () => {
          chart.toggleDataVisibility(item.datasetIndex);
          chart.update();
        };

        const box = document.createElement("span");
        box.className = "inline-block w-7 h-3 mr-2 rounded";
        box.style.background = item.fillStyle;

        const text = document.createElement("span");
        text.textContent = item.text;

        li.appendChild(box);
        li.appendChild(text);
        ul.appendChild(li);
      });
    },
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Set the label
  let selectedDateLabel;
  const formatDateInSwedish = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }); // e.g., "onsdag 23 april"
  };

  if (selectedDate === todayStr) {
    selectedDateLabel = `Idag, ${formatDateInSwedish(selectedDate)}`; //Changed!
  } else if (selectedDate === yesterdayStr) {
    selectedDateLabel = `Igår, ${formatDateInSwedish(selectedDate)}`; //Changed!
  } else if (selectedDate === tomorrowStr) {
    selectedDateLabel = `Imorgon, ${formatDateInSwedish(selectedDate)}`; //Changed!
  } else {
    selectedDateLabel = formatDateInSwedish(selectedDate); //Changed!
  }

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
  if (!data.datasets.length) return <div>Finns ingen data.</div>;

  return (
    <div className="flex flex-col mt-1 px-2 pb-10 justify-center items-center">
      {/* Your new dynamic text */}
      <p
        className="sm:text-xl text-lg font-semibold text-slate-700 mt-4 mb-4 sm:mt-2 sm:mb-7 
       px-4 py-2 flex flex-col justify-center items-center bg-slate-100"
      >
        {selectedDateLabel} | {selectedTrackLabel} | {selectedCompetitionLabel}{" "}
      </p>
      <div className="flex flex-wrap justify-start items-center gap-1 mb-4">
        {laps.length > 0 ? (
          laps.map((lap) => (
            <button
              key={lap.id}
              onClick={() => setSelectedLap(lap.id)} //Changed!
              disabled={loading}
              className={`px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm rounded ${
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
                className="bg-gray-300 rounded w-16 h-6 sm:w-20 sm:h-8 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      {/* Changed! */}
      <ul
        ref={legendRef} // Changed!
        className={`${
          isSmallScreen
            ? "grid grid-cols-3 gap-x-2 gap-y-1 mb-2 text-xs"
            : "hidden"
        }`}
      />
      <div className="w-full flex justify-center">
        {" "}
        {/* NEW wrapper to center it */}
        <div className="sm:w-[90vh] w-full sm:h-[45vh] h-[30vh] relative">
          <Bar // Changed!
            data={data}
            options={options}
            plugins={isSmallScreen ? [htmlLegendPlugin] : []} // Changed!
          />
        </div>
      </div>

      {/* Dropdowns */}
      <div className="w-full flex justify-center">
        {" "}
        {/* NEW wrapper to center */}
        <div className="flex flex-col justify-center items-center w-full sm:w-[55%] space-y-4 mt-8 sm:mt-4 sm:flex-row sm:space-y-0 sm:space-x-2 border-spacing-x-80 bg-slate-50 sm:p-4 rounded-xl border shadow-md">
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
