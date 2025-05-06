import React, { useEffect, useState } from "react";

const Skrallar = ({
  selectedDate,
  setSelectedDate,
  setSelectedView, //Changed!
  setSelectedHorse, //Changed!
}) => {
  const [dates, setDates] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/track/dates`)
      .then((r) => r.json())
      .then((all) => {
        if (!all.length) return;
        setDates(all);
        if (!selectedDate) {
          const todayStr = new Date().toISOString().split("T")[0];
          const todayObj = all.find((d) => d.date === todayStr);
          setSelectedDate(todayObj ? todayObj.date : all[all.length - 1].date);
        }
      })
      .catch(() => setError("Kunde inte hämta datum."));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchSkrallar = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/completeHorse/getSkrallar?date=${selectedDate}`
        );
        const data = await res.json();
        const withPos = data.map((h, idx) => ({
          ...h,
          position: idx + 1, //Changed!
        }));
        setHorses(withPos);
      } catch {
        setError("Kunde inte hämta skrällar.");
        setHorses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkrallar();
  }, [selectedDate]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedHorses = [...horses].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal === undefined || bVal === undefined) return 0;
    const aStr = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
    const bStr = typeof bVal === "string" ? bVal.toLowerCase() : bVal;
    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const idx = dates.findIndex((d) => d.date === selectedDate);
  const goPrev = () => idx > 0 && setSelectedDate(dates[idx - 1].date);
  const goNext = () =>
    idx < dates.length - 1 && setSelectedDate(dates[idx + 1].date);

  const niceDate = (() => {
    const date = new Date(selectedDate);
    const weekday = date.toLocaleDateString("sv-SE", { weekday: "long" });
    const capitalizedWeekday =
      weekday.charAt(0).toUpperCase() + weekday.slice(1); 
    const rest = date.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
    }); // Changed!
    return `${capitalizedWeekday}, ${rest}`;
  })();

  return (
    <div className="mx-auto max-w-screen-lg px-2 py-6 relative">
      <h1 className="text-center text-2xl sm:text-4xl font-semibold bg-slate-50 sm:p-4 rounded-xl border">
        Topp 10 tipsen
      </h1>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          disabled={idx <= 0 || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8592;
        </button>

        <h2 className="text-center text-lg sm:text-2xl font-semibold">
          {niceDate}
        </h2>

        <button
          onClick={goNext}
          disabled={idx >= dates.length - 1 || loading}
          className="p-1 text-4xl md:text-5xl disabled:opacity-40"
        >
          &#8594;
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded relative">
        {loading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75">
            <div className="loader rounded-full border-4 border-t-4 border-gray-200 h-10 w-10" />
          </div>
        )}

        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th
                onClick={() => requestSort("numberOfHorse")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                #
              </th>
              <th
                onClick={() => requestSort("nameOfHorse")}
                className="py-2 px-2 font-semibold cursor-pointer text-left border-r last:border-r-0 border-gray-300"
              >
                Häst
              </th>
              <th
                onClick={() => requestSort("analys")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Analys
              </th>
              <th
                onClick={() => requestSort("fart")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Tid
              </th>
              <th
                onClick={() => requestSort("styrka")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Prestation
              </th>
              <th
                onClick={() => requestSort("klass")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Motstånd
              </th>
              <th
                onClick={() => requestSort("prispengar")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Prispengar
              </th>
              <th
                onClick={() => requestSort("lap")}
                className="py-2 px-2 font-semibold cursor-pointer border-r last:border-r-0 border-gray-300"
              >
                Lopp
              </th>
              <th
                onClick={() => requestSort("nameOfTrack")}
                className="py-2 px-2 font-semibold cursor-pointer"
              >
                Bana
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedHorses.map((row) => (
              <tr
                key={row.horseId}
                onClick={() => {
                  setSelectedHorse(row.position - 1);
                  setSelectedView("spider");
                }}
                className="border-b last:border-b-0 border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <td className="py-1 px-2 border-r border-gray-200 align-middle">
                    <span className="inline-block border border-orange-700 px-2 py-0.5 rounded-md text-sm font-medium bg-orange-100 shadow-sm">
                      {row.numberOfHorse}
                    </span>
                </td>
                <td className="py-2 px-2 text-left border-r border-gray-200">
                  {row.nameOfHorse}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.analys}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.fart}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.styrka}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.klass}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.prispengar}
                </td>
                <td className="py-2 px-2 border-r border-gray-200">
                  {row.lap}
                </td>
                <td className="py-2 px-2">{row.nameOfTrack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
};

export default Skrallar;
