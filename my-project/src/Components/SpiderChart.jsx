// SpiderChart.jsx
import React, { useState, useEffect, useRef } from "react";
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
}) => {
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

  const [data, setData] = useState({
    labels: ["Prestation", "Placering", "Skrik", "Motstånd", "Klass", "Form", "Fart"],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(null);

  const legendRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getLegendPosition = () => (window.innerWidth >= 640 ? "right" : "top");
  const [legendPosition, setLegendPosition] = useState(getLegendPosition());
  useEffect(() => {
    const r = () => setLegendPosition(getLegendPosition());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ❌ All hämtning av datum/banor/spelformer/lopp är borttagen här 

  // ✅ Hämta endast radar-datasets 
  useEffect(() => {                            
    if (!selectedLap) return;                  
    const ac = new AbortController();          
    setLoading(true);                          

    (async () => {                             
      try {                                    
        const r = await fetch(`${API_BASE_URL}/completeHorse/findByLap?lapId=${selectedLap}`, { signal: ac.signal }); 
        if (!r.ok) throw new Error(r.statusText); 
        const completeHorses = await r.json();  

        const arr = await Promise.all(         
          completeHorses.map(async (horse, idx) => {
            const rs = await fetch(`${API_BASE_URL}/fourStarts/findData?completeHorseId=${horse.id}`, { signal: ac.signal }); 
            if (!rs.ok) throw new Error(rs.statusText); 
            const fs = await rs.json();        
            return { idx, horse, fs };         
          })
        );

        const rawDatasets = arr.map(({ idx, horse, fs }) => ({
          label: `${horse.numberOfCompleteHorse}. ${horse.nameOfCompleteHorse}`,
          data: [fs.styrka, fs.placering, fs.kusk, fs.klass, fs.prispengar, fs.form, fs.fart],
          backgroundColor: horseColors[idx % horseColors.length],
          borderColor: horseColors[idx % horseColors.length].replace("0.5", "1"),
          borderWidth: 2,
          pointRadius: 2,
        }));

        const top5Idx = rawDatasets
          .map((ds, i) => ({ i, val: ds.data[0] }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 5)
          .map((x) => x.i);

        const datasets = rawDatasets.map((ds, i) => ({
          ...ds,
          hidden: selectedHorse !== null ? i !== selectedHorse : !top5Idx.includes(i),
        }));

        if (!ac.signal.aborted) {              
          setData((p) => ({ ...p, datasets })); 
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
  }, [selectedLap, selectedHorse]);             

  useEffect(() => {
    let t;
    if (loading) t = setTimeout(() => setShowSpinner(true), 3000);
    else setShowSpinner(false);
    return () => clearTimeout(t);
  }, [loading]);

  const htmlLegendPlugin = {
    id: "htmlLegend",
    afterUpdate(chart) {
      const ul = legendRef.current;
      if (!ul) return;
      while (ul.firstChild) ul.firstChild.remove();
      chart.data.datasets.forEach((ds, idx) => {
        const li = document.createElement("li");
        li.className = "flex items-center cursor-pointer select-none whitespace-nowrap";
        const visible = chart.isDatasetVisible(idx);
        li.style.opacity = visible ? 1 : 0.35;
        li.onclick = () => {
          chart.setDatasetVisibility(idx, !chart.isDatasetVisible(idx));
          chart.update();
        };
        const box = document.createElement("span");
        box.className = "inline-block w-20 h-3 mr-2 rounded";
        box.style.background = ds.backgroundColor;
        const text = document.createElement("span");
        text.textContent = ds.label;
        li.appendChild(box);
        li.appendChild(text);
        ul.appendChild(li);
      });
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: !isSmallScreen, position: isSmallScreen ? "top" : legendPosition },
    },
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
    <div className="flex flex-col justify-center items-center mt-1 px-2 pb-10">
      <div className="sm:w-[80vh] w-full sm:h-[50vh] h-[35vh] relative flex items-center justify-center">
        {data.datasets.length > 0 && !loading && (
          <Radar data={data} options={options} plugins={[htmlLegendPlugin]} />
        )}

        {!loading && data.datasets.length === 0 && (
          <div className="text-sm text-slate-500">No data found for this lap.</div>
        )}

        {showSpinner && loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      <div className="mt-5 self-start flex flex-wrap">
        <ul ref={legendRef} className={isSmallScreen ? "relative z-10 grid grid-cols-1 gap-2 text-xs" : "hidden"} />
      </div>

      {error && <div className="text-red-600 mt-4">Error: {error}</div>}
    </div>
  );
};
export default SpiderChart;
