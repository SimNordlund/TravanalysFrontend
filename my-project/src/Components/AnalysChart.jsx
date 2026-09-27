import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import {
  barFill,
  cartesianGrid,
  chartTick,
  chartTooltip,
  horseColors,
} from "../chartTheme";

const AnalysChart = ({
  selectedLap,
  selectedHorse,
  visibleHorseIdxes,
  startsCount,
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [data, setData] = useState({
    labels: ["Delanalys 1", "Delanalys 2", "Analys"],
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
        const r = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`,
          { signal: ac.signal }
        );
        if (!r.ok) throw new Error(r.statusText);
        const horses = await r.json();

        const all = await Promise.all(
          horses.map(async (horse, idx) => {
            const rs = await fetch(
              `${API_BASE_URL}/starts/findData?completeHorseId=${horse.id}&starter=${startsCount}`,
              { signal: ac.signal }
            );
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            return { idx, horse, fs };
          })
        );

        let indicesToShow =
          Array.isArray(visibleHorseIdxes) && visibleHorseIdxes.length
            ? [...visibleHorseIdxes]
            : null;

        if (!indicesToShow) {
          if (selectedHorse != null) {
            indicesToShow = [selectedHorse];
          } else {
            indicesToShow = all.map((x) => x.idx);
            {
              /*.map((x) => ({ i: x.idx, val: x.fs.analys ?? 0 }))
              .sort((a, b) => b.val - a.val)
              .slice(0, 5)
              .map((x) => x.i); */
            }
          }
        }

        const idxToHorseNo = new Map( 
          all.map((x) => [x.idx, x.horse?.numberOfCompleteHorse ?? 0]) 
        );

        indicesToShow.sort(
          (
            a,
            b 
          ) => idxToHorseNo.get(a) - idxToHorseNo.get(b) 
        );

        const datasets = indicesToShow
          .map((i) => all.find((x) => x.idx === i))
          .filter(Boolean)
          .map((x) => {
            const color = horseColors[x.idx % horseColors.length];
            return {
              label: `${x.horse.numberOfCompleteHorse}. ${x.horse.nameOfCompleteHorse}`,
              data: [x.fs.a1 ?? 0, x.fs.a2 ?? 0, x.fs.a3 ?? 0],
              backgroundColor: barFill,
              borderColor: color,
              borderWidth: 1,
              borderRadius: 6,
              borderSkipped: "bottom",
              maxBarThickness: 30,
              hoverBackgroundColor: color,
              hoverBorderColor: color,
            };
          });

        setData({
          labels: ["Delanalys 1", "Delanalys 2", "Analys"],
          datasets,
        });
        setTitle(
          datasets.length === 1
            ? datasets[0].label
            : `${datasets.length} hästar`
        );
        setLoading(false);
      } catch (e) {
        if (ac.signal.aborted) return;
        console.error("AnalysChart:", e);
        setError(e.message);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, selectedHorse, visibleHorseIdxes, startsCount]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: { ...chartTick, stepSize: 20 },
        grid: cartesianGrid,
        border: { display: false },
      },
      x: {
        ticks: { ...chartTick, padding: 10 },
        grid: { display: false },
        border: { display: false },
        stacked: false,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...chartTooltip,
        enabled: true,
        callbacks: {
          title: (items) => items?.[0]?.label ?? "Delanalys",

          label: (item) => {
            const horse = item.dataset?.label ?? "";
            return `${horse}: ${item.formattedValue}`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-panel min-w-0">
      <div className="chart-panel-heading">
        <div>
          <p className="chart-kicker">Analysöversikt</p>
          <h3 className="chart-title">Delanalyser</h3>
          <p className="chart-description">
            Delanalyser för de antal starter man valt
          </p>
        </div>
      </div>

      <div className="chart-plot">
        <div className="relative h-[250px] w-full sm:h-[320px]">
          {data?.datasets?.length > 0 && !loading && !error && (
            <Bar data={data} options={options} />
          )}
          {!loading && !error && data?.datasets?.length === 0 && (
            <div className="chart-empty-state absolute inset-0">
              Ingen data.
            </div>
          )}
          {showSpinner && loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-500" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-red-50 px-4 text-sm text-red-600">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysChart;
