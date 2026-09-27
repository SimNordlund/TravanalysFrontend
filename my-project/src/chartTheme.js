// Shared presentation tokens keep each horse recognizable across the charts.
export const chartFont =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

export const horseColors = [
  "rgba(65, 87, 226, 1)",
  "rgba(217, 119, 6, 1)",
  "rgba(225, 76, 100, 1)",
  "rgba(5, 150, 105, 1)",
  "rgba(148, 163, 184, 1)",
  "rgba(51, 65, 85, 1)",
  "rgba(193, 153, 12, 1)",
  "rgba(44, 158, 198, 1)",
  "rgba(166, 83, 65, 1)",
  "rgba(49, 67, 143, 1)",
  "rgba(139, 145, 37, 1)",
  "rgba(100, 116, 139, 1)",
  "rgba(216, 102, 159, 1)",
  "rgba(222, 112, 48, 1)",
  "rgba(149, 79, 202, 1)",
];

export const withAlpha = (color, opacity) =>
  color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);

export const barFill = ({ chart, dataset }) => {
  const color = dataset.borderColor || horseColors[0];
  if (!chart.chartArea) return color;

  const fill = chart.ctx.createLinearGradient(
    0,
    chart.chartArea.top,
    0,
    chart.chartArea.bottom,
  );
  fill.addColorStop(0, withAlpha(color, 0.98));
  fill.addColorStop(1, withAlpha(color, 0.55));
  return fill;
};

export const chartTooltip = {
  backgroundColor: "rgba(15, 23, 42, 0.96)",
  titleColor: "#ffffff",
  bodyColor: "#e2e8f0",
  borderColor: "rgba(148, 163, 184, 0.2)",
  borderWidth: 1,
  cornerRadius: 12,
  padding: 14,
  titleFont: { family: chartFont, size: 13, weight: 600 },
  bodyFont: { family: chartFont, size: 12, weight: 400 },
  titleMarginBottom: 8,
  bodySpacing: 6,
  boxWidth: 8,
  boxHeight: 8,
  boxPadding: 5,
  usePointStyle: true,
  caretSize: 6,
  caretPadding: 8,
};

export const cartesianGrid = {
  color: "rgba(148, 163, 184, 0.16)",
  drawTicks: false,
};

export const chartTick = {
  color: "#64748b",
  font: { family: chartFont, size: 11, weight: 500 },
  padding: 10,
};
