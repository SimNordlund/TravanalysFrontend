import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function DatePicker({          // public API
  value,                                      // ISO 'YYYY-MM-DD' string
  onChange,                                   // (newDateString) => void
  min, max                                    // optional limits
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="px-2 py-1 bg-slate-200 rounded"
        onClick={() => setOpen(!open)}
      >
        📅
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-white p-2 rounded-lg shadow">
          <DayPicker
            mode="single"
            selected={new Date(value)}
            onSelect={(d) => {
              if (d) onChange(d.toISOString().split('T')[0]);
              setOpen(false);
            }}
            fromDate={min ? new Date(min) : undefined}
            toDate={max ? new Date(max) : undefined}
          />
        </div>
      )}
    </div>
  );
}