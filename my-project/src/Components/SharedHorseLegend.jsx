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


  const btnBase = "px-2 py-1 text-xs rounded sm:text-1xl tracking-tight"; 
  const activeCls = "bg-orange-500 hover:bg-orange-600 text-white shadow-md border-2 border-slate-600 font-semibold"; 
  const inactiveCls = "bg-gray-200 text-black hover:bg-blue-200"; 
  const cls = (key) => `${btnBase} ${active === key ? activeCls : inactiveCls}`; 


  const handleTop3 = () => { setUncontrolledActive("top3"); onShowTop3?.(); }; 
  const handleTop5 = () => { setUncontrolledActive("top5"); onShowTop5?.(); }; 
  const handleAll  = () => { setUncontrolledActive("all");  onShowAll?.();  }; 

  return (
    <div className="w-full mb-4">
      <div className="flex gap-2 mb:gap-3 mb-6">
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

      <ul className="grid grid-cols-1 gap-2 text-xs">
        {items?.map((it) => (
          <li
            key={it.idx}
            className={`flex items-center cursor-pointer select-none ${
              isVisible(it.idx) ? "opacity-100" : "opacity-35"
            }`}
            onClick={() => onToggle(it.idx)}
            title={it.label}
          >
            <span
              className="inline-block w-20 h-3 mr-2 rounded border border-slate-500"
              style={{ background: it.color }}
            />
            <span className={`${isVisible(it.idx) ? "" : "line-through"}`}>
              {it.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedHorseLegend;
