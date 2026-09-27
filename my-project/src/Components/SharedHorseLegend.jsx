import React, { useState } from "react"; 

const SharedHorseLegend = ({
  items,
  visibleIdxes,
  onToggle,
  onShowAll,
  onShowTop5,
  onShowTop3,
  defaultActive = "all", 
  active: controlledActive,
}) => {
  const isVisible = (i) => visibleIdxes?.includes(i);


  const [uncontrolledActive, setUncontrolledActive] = useState(defaultActive); 
  const active = controlledActive ?? uncontrolledActive; 


  const btnBase = "min-w-0 rounded-lg border px-2 py-2 text-[11px] font-semibold leading-4 tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"; 
  const activeCls = "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700"; 
  const inactiveCls = "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"; 
  const cls = (key) => `${btnBase} ${active === key ? activeCls : inactiveCls}`; 


  const handleTop3 = () => { setUncontrolledActive("top3"); onShowTop3?.(); }; 
  const handleTop5 = () => { setUncontrolledActive("top5"); onShowTop5?.(); }; 
  const handleAll  = () => { setUncontrolledActive("all");  onShowAll?.();  }; 

  return (
    <div className="chart-panel w-full min-w-0 text-left">
      <div className="mb-5">
        <h3 className="text-base font-bold tracking-tight text-slate-900">Jämför hästar</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">Välj hästar i diagrammen</p>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-50 p-1.5">
        <button
          onClick={handleTop3} 
          className={cls("top3")} 
          aria-pressed={active === "top3"} 
        >
          Visa topp 3
        </button>

        <button
          onClick={handleTop5} 
          className={cls("top5")} 
          aria-pressed={active === "top5"} 
        >
          Visa topp 5
        </button>

        <button
          onClick={handleAll} 
          className={cls("all")} 
          aria-pressed={active === "all"} 
        >
          Visa alla
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-1 text-xs">
        {items?.map((it) => (
          <li
            key={it.idx}
            className={`flex min-w-0 cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-1.5 transition-colors duration-200 hover:bg-indigo-50 ${
              isVisible(it.idx) ? "bg-slate-50 text-slate-700 opacity-100" : "text-slate-500 opacity-[0.45]"
            }`}
            onClick={() => onToggle(it.idx)}
            title={it.label}
          >
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full ring-2 ring-white shadow-sm"
              style={{ background: it.color }}
            />
            <span className={`min-w-0 font-medium leading-5 [overflow-wrap:anywhere] ${isVisible(it.idx) ? "" : "line-through"}`}>
              {it.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedHorseLegend;
