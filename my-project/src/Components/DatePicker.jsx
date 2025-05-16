import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

export default function DatePicker({
  value, // ISO 'YYYY-MM-DD' string
  onChange,
  min,
  max,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {" "}
      {/* Changed! */}
      {/* ---------- Trigger button ---------- */}
      <button
        className="border rounded px-3 py-1 text-base font-medium bg-slate-100 flex items-center gap-2" // Changed!
        onClick={() => setOpen(!open)}
      >
        📅
        <span>{value}</span> {/* Changed! */}
      </button>
      {/* ---------- Calendar pop-over ---------- */}
      {open && (
        <div className="absolute z-50 mt-2 bg-white p-2 rounded-lg shadow">
          <DayPicker
            mode="single"
            locale={sv} // Changed! 
            weekStartsOn={1} // Changed! 
            selected={value ? parseISO(value) : undefined} // Changed!
            onSelect={(d) => {
              if (d) onChange(format(d, "yyyy-MM-dd")); // Changed!
              setOpen(false);
            }}
            /* ----- Range limits (v9 API) ----- */
            disabled={[
              // Changed!
              min ? { before: parseISO(min) } : undefined, // Changed!
              max ? { after: parseISO(max) } : undefined, // Changed!
            ].filter(Boolean)} // Changed!
            startMonth={min ? parseISO(min.slice(0, 7) + "-01") : undefined} // Changed!
            endMonth={max ? parseISO(max.slice(0, 7) + "-01") : undefined} // Changed!
          />
        </div>
      )}
    </div>
  );
}
