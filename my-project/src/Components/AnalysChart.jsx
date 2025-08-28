// AnalysChart.jsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

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

const AnalysChart = ({
  selectedLap,           // samma input som SpiderChart
  selectedHorse,         // samma “vald häst”-index som spindeln använder
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");         // visat hästnamn/# i rubrik
  const [data, setData] = useState({
    labels: ["A1", "A2", "A3", "A4", "A5"],
    datasets: [],
  });

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (!selectedLap) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1) Hämta alla hästar i loppet (samma som SpiderChart)
        const r = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`,
          { signal: ac.signal }
        );
        if (!r.ok) throw new Error(r.statusText);
        const horses = await r.json();

        // 2) Hämta fourStarts för alla hästar (samma som SpiderChart)
        const all = await Promise.all(
          horses.map(async (horse, idx) => {
            const rs = await fetch(
              `${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`,
              { signal: ac.signal }
            );
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            return { idx, horse, fs };
          })
        );

        // 3) Välj aktiv häst: använd selectedHorse om satt, annars högst “styrka”
        let activeIdx = selectedHorse ?? null;
        if (activeIdx == null) {
          activeIdx = all
            .map((x) => ({ i: x.idx, val: x.fs.styrka ?? 0 }))
            .sort((a, b) => b.val - a.val)[0]?.i ?? 0;
        }

        const active = all.find((x) => x.idx === activeIdx) ?? all[0];
        const color = horseColors[active.idx % horseColors.length];
        const stroke = color.replace("0.5", "1");

        // 4) Bygg dataset för A1–A5
        const aVals = [
          active.fs.a1 ?? 0,
          active.fs.a2 ?? 0,
          active.fs.a3 ?? 0,
          active.fs.a4 ?? 0,
          active.fs.a5 ?? 0,
        ];

        setData({
          labels: ["A1", "A2", "A3", "A4", "A5"],
          datasets: [
            {
              label: `${active.horse.numberOfCompleteHorse}. ${active.horse.nameOfCompleteHorse}`,
              data: aVals,
              backgroundColor: color,
              borderColor: stroke,
              borderWidth: 2,
            },
          ],
        });

        setTitle(`${active.horse.numberOfCompleteHorse}. ${active.horse.nameOfCompleteHorse}`);
        setLoading(false);
      } catch (e) {
        if (ac.signal.aborted) return;
        console.error("AnalysChart:", e);
        setError(e.message);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, selectedHorse]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,     // A-värden är 0–100
        ticks: { stepSize: 20 },
      },
      x: {
        ticks: { padding: 4 },
      },
    },
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (items) => (items?.[0]?.label ? items[0].label : "A-värde"),
          label: (item) => `${item.formattedValue}`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col justify-center items-center mt-1 px-2 pb-10">
      <div className="w-full text-center mb-2">
        <p className="text-sm sm:text-base text-slate-700 font-semibold">
          A1–A5 för {title || "vald häst"}
        </p>
      </div>

      <div className="sm:w-[80vh] w-full sm:h-[40vh] h-[30vh] relative flex items-center justify-center">
        {data?.datasets?.length > 0 && !loading && !error && (
          <Bar data={data} options={options} />
        )}

        {!loading && !error && data?.datasets?.length === 0 && (
          <div className="text-sm text-slate-500">Ingen data för A1–A5.</div>
        )}

        {showSpinner && loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">Error: {error}</div>
        )}
      </div>
    </div>
  );
};

export default AnalysChart;
