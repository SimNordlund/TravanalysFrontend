import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const horseColors = [
  "rgba(0, 0, 255, 0.5)","rgba(255, 165, 0, 0.5)","rgba(255, 0, 0, 0.5)",
  "rgba(0, 100, 0, 0.5)","rgba(211, 211, 211, 0.5)","rgba(0, 0, 0, 0.5)",
  "rgba(255, 255, 0, 0.5)","rgba(173, 216, 230, 0.5)","rgba(165, 42, 42, 0.5)",
  "rgba(0, 0, 139, 0.5)","rgba(204, 204, 0, 0.5)","rgba(105, 105, 105, 0.5)",
  "rgba(255, 192, 203, 0.5)","rgba(255, 140, 0, 0.5)","rgba(128, 0, 128, 0.5)",
];

const AnalysChart = ({ selectedLap, selectedHorse, visibleHorseIdxes }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [data, setData] = useState({ labels: ["Delanalys 1", "Delanalys 2", "Delanalys 3", "Delanalys 4", "Delanalys 5"], datasets: [] });

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
        const r = await fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`, { signal: ac.signal });
        if (!r.ok) throw new Error(r.statusText);
        const horses = await r.json();

        const all = await Promise.all(
          horses.map(async (horse, idx) => {
            const rs = await fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`, { signal: ac.signal });
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            return { idx, horse, fs };
          })
        );

        let indicesToShow =
          Array.isArray(visibleHorseIdxes) && visibleHorseIdxes.length ? [...visibleHorseIdxes] : null;

        if (!indicesToShow) {
          if (selectedHorse != null) {
            indicesToShow = [selectedHorse];
          } else {
            indicesToShow = all
              .map((x) => ({ i: x.idx, val: x.fs.styrka ?? 0 }))
              .sort((a, b) => b.val - a.val)
              .slice(0, 5)
              .map((x) => x.i);
          }
        }

        const datasets = indicesToShow
          .map((i) => all.find((x) => x.idx === i))
          .filter(Boolean)
          .map((x) => {
            const color = horseColors[x.idx % horseColors.length];
            const stroke = color.replace("0.5", "1");
            return {
              label: `${x.horse.numberOfCompleteHorse}. ${x.horse.nameOfCompleteHorse}`,
              data: [x.fs.a1 ?? 0, x.fs.a2 ?? 0, x.fs.a3 ?? 0, x.fs.a4 ?? 0, x.fs.a5 ?? 0, x.fs.a6 ?? 0],
              backgroundColor: color,
              borderColor: "rgba(0,0,0,1)",
              borderWidth: 0.5,
            };
          });

        setData({ labels: ["Delanalys 1", "Delanalys 2", "Delanalys 3", "Delanalys 4", "Delanalys 5", "Delanalys 6"], datasets });
        setTitle(datasets.length === 1 ? datasets[0].label : `${datasets.length} hästar`);
        setLoading(false);
      } catch (e) {
        if (ac.signal.aborted) return;
        console.error("AnalysChart:", e);
        setError(e.message);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, selectedHorse, visibleHorseIdxes]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, suggestedMax: 100, ticks: { stepSize: 20 } },
      x: { ticks: { padding: 4 }, stacked: false },
    },
    plugins: {
      legend: { display: false }, // shared legend handles this
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
    <div className="flex flex-col justify-center items-center mt-1 sm:mt-0 px-2 pb-10">
      <div className="w-full text-center mb-1">
        <p className="text-sm sm:text-base text-slate-700 font-semibold">
          Från detalj till total analys
        </p>
      </div>

      <div className="w-full max-w-[950px] mx-auto">
        <div className="relative w-full h-[300px] sm:h-[300px]">
          {data?.datasets?.length > 0 && !loading && !error && <Bar data={data} options={options} />}
          {!loading && !error && data?.datasets?.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              Ingen data.
            </div>
          )}
          {showSpinner && loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
            </div>
          )}
          {error && <div className="absolute inset-0 flex items-center justify-center text-red-600 text-sm">Error: {error}</div>}
        </div>
      </div>
    </div>
  );
};

export default AnalysChart;
