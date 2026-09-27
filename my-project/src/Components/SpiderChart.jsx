import React, { useState, useEffect, useMemo, useRef } from "react";
import { Radar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { chartFont, chartTooltip, horseColors, withAlpha } from "../chartTheme";

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
  visibleHorseIdxes,
  onMetaChange,
  startsCount,
}) => {
  const normalizeStarter = (v) => String(v ?? "").trim() || "0"; 

  const [rawDatasets, setRawDatasets] = useState([]);
  const chartRef = useRef(null);
  const data = useMemo(() => ({
    labels: ["Prestation", "Placering", "Skrik", "Motstånd", "Klass", "Form", "Fart"],
    datasets: rawDatasets,
  }), [rawDatasets]);
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return; 
    const ac = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`,
          { signal: ac.signal }
        );
        if (!r.ok) throw new Error(r.statusText);
        const horses = await r.json();

        const starterParam = encodeURIComponent(normalizeStarter(startsCount)); 

        const arr = await Promise.all(
          horses.map(async (horse, idx) => {
            const rs = await fetch(
              `${API_BASE_URL}/starts/findData?completeHorseId=${horse.id}&starter=${starterParam}`, 
              { signal: ac.signal }
            );
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            return { idx, horse, fs };
          })
        );

        const raw = arr.map(({ idx, horse, fs }) => ({
          label: `${horse.numberOfCompleteHorse}. ${horse.nameOfCompleteHorse}`,
          data: [
            fs.styrka,
            fs.placering,
            fs.kusk,
            fs.klass,
            fs.prispengar,
            fs.form,
            fs.fart,
          ],
          backgroundColor: withAlpha(horseColors[idx % horseColors.length], 0.12),
          borderColor: horseColors[idx % horseColors.length],
          borderWidth: 2.5,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: horseColors[idx % horseColors.length],
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: horseColors[idx % horseColors.length],
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
        }));

        const top3Idx = arr
          .map((x) => ({ i: x.idx, val: x.fs.analys ?? 0 }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 3)
          .map((x) => x.i);

        const top5Idx = arr
          .map((x) => ({ i: x.idx, val: x.fs.analys ?? 0 }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 5)
          .map((x) => x.i);

        const suggestedVisibleIdxes =
          selectedHorse !== null ? [selectedHorse] : raw.map((_, i) => i);

        if (!ac.signal.aborted) {
          setRawDatasets(raw);
          setLoading(false);
          onMetaChange?.({
            items: raw.map((ds, i) => ({
              idx: i,
              label: ds.label,
              color: ds.borderColor,
            })),
            suggestedVisibleIdxes,
            top5Idx,
            top3Idx,
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
  }, [selectedLap, selectedHorse, startsCount, API_BASE_URL]); 

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || loading) return;

    const vis = new Set(visibleHorseIdxes ?? []);
    const transitions = new Map();
    chart.data.datasets.forEach((_, i) => {
      const visible = vis.has(i);
      if (chart.isDatasetVisible(i) === visible) return;
      transitions.set(i, visible ? "show" : "hide");
    });

    transitions.forEach((mode, i) => {
      if (mode === "show") chart.show(i);
      else chart.hide(i);
    });

    // Keep every changed dataset in its fade transition during a group update.
    if (transitions.size > 1) {
      chart.update((ctx) => transitions.get(ctx.datasetIndex));
    }
  }, [data, visibleHorseIdxes, loading]);

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 450, easing: "easeInOutQuart" },
    transitions: {
      show: { animation: { duration: 450, easing: "easeInOutQuart" } },
      hide: { animation: { duration: 450, easing: "easeInOutQuart" } },
    },
    plugins: {
      legend: { display: false },
      tooltip: chartTooltip,
    },
    scales: {
      r: {
        angleLines: { display: true, color: "rgba(148, 163, 184, 0.16)" },
        grid: { color: "rgba(148, 163, 184, 0.22)", circular: false },
        border: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
        pointLabels: {
          padding: 10,
          font: (ctx) => ({
            size: ctx.chart.width < 400 ? 11 : 13,
            weight: 600,
            family: chartFont,
          }),
          color: "#334155",
        },
        ticks: { display: false },
      },
    },
    elements: { line: { borderWidth: 2.5 } },
  }), []);

  return (
    <div className="chart-panel flex h-full min-w-0 flex-col">
      <div className="chart-panel-heading">
        <div>
          <p className="chart-kicker">Sju perspektiv</p>
          <h3 className="chart-title">Hästprofil</h3>
          <p className="chart-description">
            Analysperspektiven till en total analys
          </p>
        </div>
      </div>

      <div className="chart-plot flex flex-1 items-center justify-center">
        <div className="relative mx-auto aspect-square w-full max-w-[490px]">
          {data.datasets.length > 0 && !loading && (
            <Radar ref={chartRef} data={data} options={options} />
          )}

          {!loading && data.datasets.length === 0 && (
            <div className="chart-empty-state absolute inset-0">
              No data found for this lap.
            </div>
          )}

          {showSpinner && loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-500" />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">Error: {error}</div>
      )}
    </div>
  );
};

export default SpiderChart;
