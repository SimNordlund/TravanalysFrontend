import React from "react";

const SharedHorseLegend = ({
  items,          
  visibleIdxes,     
  onToggle,         
  onShowAll,      
  onShowTop5,       
}) => {
  const isVisible = (i) => visibleIdxes?.includes(i);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <button
          onClick={onShowAll}
          className="px-3 py-1 text-xs rounded bg-orange-500 hover:bg-orange-800 text-1xl font-semibold tracking-tight text-white sm:text-1xl"
        >
          Visa alla
        </button>
        <button
          onClick={onShowTop5}
          className="px-2 py-1 text-xs rounded bg-orange-500 hover:bg-orange-800 text-1xl font-semibold tracking-tight text-white sm:text-1xl"
        >
          Visa topp 5
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
              className="inline-block w-20 h-3 mr-2 rounded"
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
