import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

export default function DatePicker({
  value, 
  onChange,
  min,
  max,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">

      <button
        className="border rounded px-3 py-1 text-base font-medium bg-slate-100 flex items-center gap-2" 
        onClick={() => setOpen(!open)}
      >
        📅
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
            ].filter(Boolean)} 
            startMonth={min ? parseISO(min.slice(0, 7) + "-01") : undefined} 
            endMonth={max ? parseISO(max.slice(0, 7) + "-01") : undefined} 
          />
        </div>
      )}
    </div>
  );
}
