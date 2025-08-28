import React, { useState, useEffect } from "react";
import { Radar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const SpiderChart = ({
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
  selectedHorse,
  visibleHorseIdxes,     // from parent
  onMetaChange,          // report legend items + suggested visible
}) => {
  const horseColors = [
    "rgba(0, 0, 255, 0.5)","rgba(255, 165, 0, 0.5)","rgba(255, 0, 0, 0.5)",
    "rgba(0, 100, 0, 0.5)","rgba(211, 211, 211, 0.5)","rgba(0, 0, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)","rgba(173, 216, 230, 0.5)","rgba(165, 42, 42, 0.5)",
    "rgba(0, 0, 139, 0.5)","rgba(204, 204, 0, 0.5)","rgba(105, 105, 105, 0.5)",
    "rgba(255, 192, 203, 0.5)","rgba(255, 140, 0, 0.5)","rgba(128, 0, 128, 0.5)",
  ];

  const [rawDatasets, setRawDatasets] = useState([]);
  const [data, setData] = useState({
    labels: ["Prestation", "Placering", "Skrik", "Motstånd", "Klass", "Form", "Fart"],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // fetch data (no hidden flags here)
  useEffect(() => {
    if (!selectedLap) return;
    const ac = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`, { signal: ac.signal });
        if (!r.ok) throw new Error(r.statusText);
        const horses = await r.json();

        const arr = await Promise.all(
          horses.map(async (horse, idx) => {
            const rs = await fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`, { signal: ac.signal });
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            return { idx, horse, fs };
          })
        );

        const raw = arr.map(({ idx, horse, fs }) => ({
          label: `${horse.numberOfCompleteHorse}. ${horse.nameOfCompleteHorse}`,
          data: [fs.styrka, fs.placering, fs.kusk, fs.klass, fs.prispengar, fs.form, fs.fart],
          backgroundColor: horseColors[idx % horseColors.length],
          borderColor: horseColors[idx % horseColors.length].replace("0.5", "1"),
          borderWidth: 2,
          pointRadius: 2,
        }));

        const top5Idx = arr
          .map((x) => ({ i: x.idx, val: x.fs.styrka ?? 0 }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 5)
          .map((x) => x.i);
        const suggestedVisibleIdxes = selectedHorse !== null ? [selectedHorse] : top5Idx;

        if (!ac.signal.aborted) {
          setRawDatasets(raw);
          setLoading(false);
          onMetaChange?.({
            items: raw.map((ds, i) => ({ idx: i, label: ds.label, color: ds.backgroundColor })),
            suggestedVisibleIdxes,
             top5Idx,
          });
        }
      } catch (e) {
        if (ac.signal.aborted) return;
        console.error("SpiderChart:", e);
        setError(e.message);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, selectedHorse]);

  // apply visibility from parent
  useEffect(() => {
    if (!rawDatasets.length) { setData((p) => ({ ...p, datasets: [] })); return; }
    const vis = new Set(visibleHorseIdxes ?? []);
    const ds = rawDatasets.map((d, i) => ({ ...d, hidden: !vis.has(i) }));
    setData((p) => ({ ...p, datasets: ds }));
  }, [rawDatasets, visibleHorseIdxes]);

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
        pointLabels: { padding: 5, font: { size: 12, weight: "bold" }, color: "#000" },
        ticks: { display: false },
      },
    },
    elements: { line: { borderWidth: 2 } },
  };

  return (
    <div className="flex flex-col mt-0 px-2 pb-4">
      <div className="w-full max-w-[490px] mx-auto">
        <div className="relative w-full aspect-square">
          {data.datasets.length > 0 && !loading && <Radar data={data} options={options} />}
          {!loading && data.datasets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              No data found for this lap.
            </div>
          )}
          {showSpinner && loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>
      {error && <div className="text-red-600 mt-4 text-center">Error: {error}</div>}
    </div>
  );
};
export default SpiderChart;
