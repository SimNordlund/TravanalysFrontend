import React, { useEffect, useState, useRef } from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import DatePicker from "./Components/DatePicker";
import HorseRunLoader from "./Components/HorseRunLoader";
import Chart from "chart.js/auto";
import { BarChart3, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import {
  cartesianGrid,
  chartFont,
  chartTick,
  chartTooltip,
  horseColors,
  withAlpha,
} from "./chartTheme";

Chart.defaults.font.family =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'";
Chart.defaults.font.weight = 400;

const getHorsePlacement = (name) => {
  const match = String(name ?? "").match(/\((\d+)\)\s*$/);
  return match ? Number(match[1]) : null;
};

const removeHorsePlacementMarker = (name) =>
  String(name ?? "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .trim();

const getPlacementLabel = (placement) => {
  if (!placement) return "";
  return `${placement}:${placement <= 2 ? "a" : "e"}`;
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const horsePlacementBadgePlugin = {
  id: "horsePlacementBadge",
  afterDatasetsDraw(chart) {
    const { ctx, chartArea } = chart;

    ctx.save();
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (
        !dataset.horsePlacement ||
        dataset.horsePlacement > 3 || //Uppdatera denna för att justera hur många placeringar som ska visas. Just nu visas endast 1:a, 2:a och 3:e plats och stöd finns för tot 6.
        !chart.isDatasetVisible(datasetIndex)
      ) {
        return;
      }

      const meta = chart.getDatasetMeta(datasetIndex);
      const compactLabel =
        chart.options.plugins?.horsePlacementBadge?.compactLabel;
      const text = compactLabel
        ? String(dataset.horsePlacement)
        : dataset.horsePlacementLabel || String(dataset.horsePlacement);

      meta.data.forEach((element, dataIndex) => {
        if (
          dataset.data?.[dataIndex] === null ||
          dataset.data?.[dataIndex] === undefined
        ) {
          return;
        }

        const position = element.tooltipPosition();
        const fontSize = compactLabel ? 10 : 11;
        const horizontalPadding = compactLabel ? 8 : 14;
        const height = compactLabel ? 17 : 20;
        const minWidth = compactLabel ? 22 : 30;
        const radius = compactLabel ? 6 : 7;
        ctx.font = `700 ${fontSize}px ${Chart.defaults.font.family}`;
        const width = Math.max(
          ctx.measureText(text).width + horizontalPadding,
          minWidth,
        );
        const x = position.x - width / 2;
        const y = Math.max(chartArea.top + 4, position.y - height - 10);
        const badgeColor = dataset.horsePlacementBadgeColor || horseColors[0];
        ctx.fillStyle = withAlpha(badgeColor, 0.12);
        drawRoundedRect(ctx, x, y, width, height, radius);
        ctx.fill();
        ctx.strokeStyle = withAlpha(badgeColor, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#334155";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, position.x, y + height / 2 + 0.5);
      });
    });
    ctx.restore();
  },
};

const BarChartComponent = ({
  selectedDate,
  setSelectedDate,
  selectedTrack,
  setSelectedTrack,
  selectedCompetition,
  setSelectedCompetition,
  selectedLap,
  setSelectedLap,
  dates,
  tracks,
  competitions,
  laps,
  setSelectedView,
  setSelectedHorse,
  setVisibleHorseIdxes,
  startsCount,
  setStartsCount,
  setLegendMode,
}) => {
  const legendRef = useRef(null);
  const chartRef = useRef(null);

  const [data, setData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const [availableCounts, setAvailableCounts] = useState([]);
  const [availLoading, setAvailLoading] = useState(false);

  const normalizeStarter = (v) => String(v ?? "").trim() || "0";

  const starterLabel = (starter) => {
    const s = normalizeStarter(starter);
    if (s === "0") return "Analys";
    return s;
  };

  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () => idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () =>
    idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!API_BASE_URL) {
      setError("VITE_API_BASE_URL saknas. Lägg till den i .env och starta om.");
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return;
    const ac = new AbortController();
    setAvailLoading(true);

    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/starts/available?lapId=${selectedLap}`,
          { signal: ac.signal },
        );
        if (!r.ok) throw new Error(r.statusText);

        const countsRaw = await r.json();
        const counts = (Array.isArray(countsRaw) ? countsRaw : []).map((c) =>
          normalizeStarter(c),
        );

        setAvailableCounts(counts);

        const current = normalizeStarter(startsCount);
        if (counts.length && !counts.includes(current)) {
          setStartsCount(counts[0]);
        }
      } catch {
      } finally {
        if (!ac.signal.aborted) setAvailLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, API_BASE_URL, startsCount, setStartsCount]);

  // HÄMTA ENDAST BAR-DATA
  useEffect(() => {
    if (!selectedLap || !API_BASE_URL) return;
    const ac = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const r = await fetch(
          `${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`,
          { signal: ac.signal },
        );
        if (!r.ok) throw new Error(r.statusText);
        const completeHorses = await r.json();
        const labels = completeHorses.map((h) => `${h.numberOfCompleteHorse}.`);

        const starterParam = encodeURIComponent(normalizeStarter(startsCount));

        const datasets = await Promise.all(
          completeHorses.map(async (horse, idx) => {
            const rs = await fetch(
              `${API_BASE_URL}/starts/findData?completeHorseId=${horse.id}&starter=${starterParam}`,
              { signal: ac.signal },
            );
            if (!rs.ok) throw new Error(rs.statusText);
            const fs = await rs.json();
            const horsePlacement = getHorsePlacement(horse.nameOfCompleteHorse);
            const cleanHorseName = removeHorsePlacementMarker(
              horse.nameOfCompleteHorse,
            );
            const placementLabel = getPlacementLabel(horsePlacement);
            const col = horseColors[idx % horseColors.length];

            return {
              label: `${horse.numberOfCompleteHorse}. ${cleanHorseName}`,
              cleanHorseName,
              horsePlacement,
              horsePlacementLabel: placementLabel,
              horsePlacementBadgeColor: col,
              vOdds: horse.vOdds ?? null,
              data: labels.map((_, i) =>
                i === idx ? (fs?.analys ?? 0) : null,
              ),
              backgroundColor: withAlpha(col, 0.55),
              borderColor: col,
              borderWidth: 2,
              borderSkipped: false,
              borderRadius: { topLeft: 7, topRight: 7 },
              hoverBackgroundColor: withAlpha(col, 0.65),
              hoverBorderColor: col,
              maxBarThickness: 44,
            };
          }),
        );

        if (!ac.signal.aborted) {
          setData({ labels, datasets });
          setLoading(false);
        }
      } catch (e) {
        if (ac.signal.aborted) return;
        console.error("data:", e);
        setError(e.message);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [selectedLap, startsCount, API_BASE_URL]);

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  const handleBarClick = (evt) => {
    if (!chartRef.current) return;
    const els = getElementAtEvent(chartRef.current, evt);
    if (!els.length) return;
    const { datasetIndex } = els[0];
    setSelectedHorse(datasetIndex);
    setVisibleHorseIdxes?.([datasetIndex]);
    setLegendMode?.("custom");
    setSelectedView("spider");
  };

  // Mobile legend
  const htmlLegendPlugin = {
    id: "htmlLegend",
    afterUpdate(chart) {
      const ul = legendRef.current;
      if (!ul) return;
      while (ul.firstChild) ul.firstChild.remove();

      chart.legend.legendItems.forEach((item) => {
        const li = document.createElement("li");
        li.className = "chart-mobile-legend-item";
        const visible = chart.isDatasetVisible(item.datasetIndex);
        li.style.opacity = visible ? 1 : 0.45;

        li.onclick = () => {
          if (chart.isDatasetVisible(item.datasetIndex))
            chart.hide(item.datasetIndex);
          else chart.show(item.datasetIndex);
        };

        const box = document.createElement("span");
        box.className =
          "inline-block h-2.5 w-2.5 shrink-0 rounded-full";
        box.style.background = item.strokeStyle;

        const text = document.createElement("span");
        text.textContent = item.text;
        text.className = "min-w-0 break-words leading-relaxed";
        text.style.textDecoration = visible ? "none" : "line-through";
        li.appendChild(box);
        li.appendChild(text);
        ul.appendChild(li);
      });
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 12, right: 6 } },
    scales: {
      y: {
        beginAtZero: true,
        minBarLength: 10,
        grace: "16%",
        border: { display: false, dash: [4, 5] },
        grid: cartesianGrid,
        ticks: chartTick,
      },
      x: {
        stacked: true,
        border: { display: false },
        grid: { display: false },
        ticks: { ...chartTick, autoSkip: false, maxRotation: 0, padding: 8 },
      },
    },
    plugins: {
      legend: {
        display: !isSmallScreen,
        position: isSmallScreen ? "top" : "right",
        align: "start",
        labels: {
          boxWidth: 9,
          boxHeight: 9,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 9,
          color: "#475569",
          font: { family: chartFont, weight: 500, size: 11 },
        },
      },
      horsePlacementBadge: { compactLabel: isSmallScreen },
      tooltip: {
        ...chartTooltip,
        enabled: true,
        callbacks: {
          title: (items) => items[0]?.dataset?.cleanHorseName || "Analys",
          label: (context) => `Analys: ${context.parsed.y ?? 0}`,
          afterLabel: (context) =>
            context.dataset.horsePlacement
              ? `Placering: ${context.dataset.horsePlacementLabel}`
              : null,
        },
      },
    },
  };

  const winnerHorse = data.datasets.find(
    (dataset) => dataset.horsePlacement === 1,
  );
  const winnerHorseName = winnerHorse?.cleanHorseName || winnerHorse?.label || "";
  const hasWinnerOdds =
    winnerHorse?.vOdds !== null &&
    winnerHorse?.vOdds !== undefined &&
    String(winnerHorse.vOdds).trim() !== "";
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today - 864e5).toISOString().split("T")[0];
  const tomorrowStr = new Date(+today + 864e5).toISOString().split("T")[0];

  const fmt = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const weekday = date.toLocaleDateString("sv-SE", { weekday: "long" });
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const rest = date.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
    });
    return `${capitalizedWeekday}, ${rest}`;
  };

  const selectedDateLabel = !selectedDate
    ? "Laddar datum…"
    : selectedDate === todayStr
      ? `Idag, ${fmt(selectedDate)}`
      : selectedDate === yesterdayStr
        ? `Igår, ${fmt(selectedDate)}`
        : selectedDate === tomorrowStr
          ? `Imorgon, ${fmt(selectedDate)}`
          : fmt(selectedDate);

  const selectedTrackLabel =
    tracks.find((t) => t.id === +selectedTrack)?.nameOfTrack ?? "Färjestad";

  const selectedCompetitionLabel =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "v85";

  const compName =
    competitions.find((c) => c.id === +selectedCompetition)
      ?.nameOfCompetition ?? "";

  const lapPrefix = /proposition/i.test(compName)
    ? "Prop"
    : /^(vinnare|plats)$/i.test(compName.trim())
      ? "Lopp"
      : "Avd";

  if (error) return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="analytics-section relative mx-auto w-full">
      <div className="chart-panel-heading">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white text-indigo-600 shadow-sm" aria-hidden="true">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="chart-title">Analys</h2>
          </div>
        </div>
      </div>

      <p className="analytics-context">
        <span className="max-w-full break-words">{selectedDateLabel}</span>
        <span
          className="h-1 w-1 shrink-0 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <span className="break-words text-slate-600">{selectedTrackLabel}</span>
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600">{selectedCompetitionLabel}</span>
      </p>

      <div className="analytics-date-nav chart-date-controls">
        <button
          type="button"
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          className="analytics-arrow"
          aria-label="Föregående datum"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          min={dates[0]?.date}
          max={dates[dates.length - 1]?.date}
          availableDates={dates.map((d) => d.date)}
        />

        <button
          type="button"
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          className="analytics-arrow"
          aria-label="Nästa datum"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="analytics-filter-row">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            disabled={loading}
            aria-pressed={t.id === +selectedTrack}
            className={`chart-filter chart-filter-track ${
              t.id === +selectedTrack
                ? "chart-filter-active"
                : ""
            }`}
          >
            {t.nameOfTrack}
          </button>
        ))}
      </div>

      <div className="analytics-filter-row">
        {competitions.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompetition(c.id)}
            disabled={loading}
            aria-pressed={c.id === +selectedCompetition}
            className={`chart-filter chart-filter-competition ${
              c.id === +selectedCompetition
                ? "chart-filter-active"
                : ""
            }`}
          >
            {c.nameOfCompetition}
          </button>
        ))}
      </div>

      <div className="analytics-filter-row">
        {laps.length > 0 ? (
          laps.map((lap) => {
            const lapNo = String(lap.nameOfLap).trim();
            const lapText = isSmallScreen
              ? `${lapPrefix}${lapNo}`
              : `${lapPrefix} ${lapNo}`;

            return (
              <button
                key={lap.id}
                onClick={() => setSelectedLap(lap.id)}
                disabled={loading}
                aria-pressed={lap.id === +selectedLap}
                className={`chart-filter chart-filter-lap ${
                  lap.id === +selectedLap
                    ? "chart-filter-active"
                    : ""
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {lapText}
              </button>
            );
          })
        ) : (
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-16 animate-pulse rounded-lg bg-slate-100 sm:w-20"
              />
            ))}
          </div>
        )}
      </div>

      <div className="analytics-filter-row min-h-[40px]">
        {!availLoading &&
          availableCounts.map((n) => (
            <button
              key={String(n)}
              onClick={() => setStartsCount(String(n))}
              disabled={loading}
              aria-pressed={normalizeStarter(startsCount) === normalizeStarter(n)}
              className={`chart-filter chart-filter-analysis ${
                normalizeStarter(startsCount) === normalizeStarter(n)
                  ? "chart-filter-active"
                  : ""
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {starterLabel(n)}
            </button>
          ))}
      </div>

      <div className="chart-panel-heading mt-5 border-t border-slate-100 pt-5">
        <div>
          <h3 className="chart-title">Total analys</h3>
          <p className="chart-description">
            Total analys och övergripande beslutsunderlag
          </p>
        </div>
      </div>

      <div className="w-full">
        <ul
          ref={legendRef}
          className={
            isSmallScreen ? "mb-4 grid grid-cols-2 gap-1.5 text-[11px]" : "hidden"
          }
        />
      </div>

      {!loading && winnerHorse && (
        <div className="mb-4 flex">
          <div className="analytics-winner">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600" aria-hidden="true">
              <Trophy className="h-4 w-4" />
            </span>
            <span className="min-w-0 break-words leading-relaxed">
              Vinnare: {winnerHorseName}
              {hasWinnerOdds ? `, Odds: ${winnerHorse.vOdds}` : ""}
            </span>
          </div>
        </div>
      )}

      <div className="chart-plot w-full">
        <div className="relative flex h-[280px] w-full items-center justify-center sm:h-[370px]">
          {data.datasets.length > 0 && !loading && (
            <Bar
              ref={chartRef}
              data={data}
              options={options}
              plugins={
                isSmallScreen
                  ? [htmlLegendPlugin, horsePlacementBadgePlugin]
                  : [horsePlacementBadgePlugin]
              }
              onClick={handleBarClick}
            />
          )}

          {!loading && data.datasets.length === 0 && (
            <div className="chart-empty-state absolute inset-0">Finns ingen data.</div>
          )}

          {showSpinner && loading && <HorseRunLoader />}
        </div>
      </div>

    </div>
  );
};

export default BarChartComponent;
