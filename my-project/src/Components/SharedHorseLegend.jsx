import React, { useState } from "react"; //Changed!

const SharedHorseLegend = ({
  items,
  visibleIdxes,
  onToggle,
  onShowAll,
  onShowTop5,
  onShowTop3,
  // Optional: låt föräldern styra aktivt läge genom att skicka in defaultActive/active
  defaultActive = "all", //Changed!
  active: controlledActive, //Changed!
}) => {
  const isVisible = (i) => visibleIdxes?.includes(i);

  // Om controlledActive finns används det, annars intern state //Changed!
  const [uncontrolledActive, setUncontrolledActive] = useState(defaultActive); //Changed!
  const active = controlledActive ?? uncontrolledActive; //Changed!

  // DRY: klassgenerator för knapparna //Changed!
  const btnBase = "px-2 py-1 text-xs rounded sm:text-1xl font-semibold tracking-tight"; //Changed!
  const activeCls = "bg-orange-500 hover:bg-orange-600 text-white shadow-md border-2 border-slate-600"; //Changed!
  const inactiveCls = "bg-gray-200 text-black hover:bg-blue-200"; //Changed!
  const cls = (key) => `${btnBase} ${active === key ? activeCls : inactiveCls}`; //Changed!

  // Helpers som både sätter aktiv knapp och anropar din callback //Changed!
  const handleTop3 = () => { setUncontrolledActive("top3"); onShowTop3?.(); }; //Changed!
  const handleTop5 = () => { setUncontrolledActive("top5"); onShowTop5?.(); }; //Changed!
  const handleAll  = () => { setUncontrolledActive("all");  onShowAll?.();  }; //Changed!

  return (
    <div className="w-full">
      <div className="flex gap-2 mb:gap-3 mb-4">
        <button
          onClick={handleTop3} //Changed!
          className={cls("top3")} //Changed!
          aria-pressed={active === "top3"} //Changed!
        >
          Visa topp 3
        </button>

        <button
          onClick={handleTop5} //Changed!
          className={cls("top5")} //Changed!
          aria-pressed={active === "top5"} //Changed!
        >
          Visa topp 5
        </button>

        <button
          onClick={handleAll} //Changed!
          className={cls("all")} //Changed!
          aria-pressed={active === "all"} //Changed!
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
