import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";
import calenderImage from "../Bilder/kal1.svg";

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  availableDates = [], 
}) {
  const [open, setOpen] = useState(false);

  const availableSet = new Set(availableDates);

  const disableIfNoData = (d) => !availableSet.has(format(d, "yyyy-MM-dd"));

  return (
    <div className="relative inline-block">
      <button
        className="border rounded pl-1 pr-2 py-0 text-base font-medium bg-slate-100 flex items-center gap-2"
        onClick={() => setOpen(!open)}
      >
        <img
          src={calenderImage}
          alt=""
          aria-hidden="true"
          className="w-9 h-9 shrink-0"
        />
        <span>{value}</span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 bg-white p-3 rounded-lg shadow
                     left-1/2 -translate-x-1/2
                     md:left-auto md:right-0 md:translate-x-0
                     w-[90vw] max-w-sm"
        >
          <DayPicker
            mode="single"
            locale={sv}
            weekStartsOn={1}
            selected={value ? parseISO(value) : undefined}
            onSelect={(d) => {
              if (d) onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }}
            disabled={[
              min ? { before: parseISO(min) } : undefined,
              max ? { after: parseISO(max) } : undefined,
              disableIfNoData,
            ].filter(Boolean)}
            startMonth={min ? parseISO(min.slice(0, 7) + "-01") : undefined}
            endMonth={max ? parseISO(max.slice(0, 7) + "-01") : undefined}
            defaultMonth={value ? parseISO(value) : undefined}
          />
        </div>
      )}
    </div>
  );
}
