import React from "react";

/**
 * Utility to determine the text color based on numeric trend value.
 */
function getTrendColorClass(trendString) {
  // Example inputs are "+0.78", "-1.24", "+0.00"
  // Remove '+' for easier parsing:
  const numericValue = parseFloat(trendString.replace("+", ""));
  if (numericValue > 0) {
    return "text-green-600";
  } else if (numericValue < 0) {
    return "text-red-600";
  }
  return "text-black";
}

const Avdelning5Table = () => {
  // Hard-coded table data to match the screenshot
  const rows = [
    {
      horse: "Express Cash v5",
      kusk: "Andreas Lövdal",
      v75: "28%",
      trend: "+0.78",
      vOdds: "9.79",
      trainer: "Andreas Lövdal",
      tips: "Är snabb och har ett passande utgångsläge. Vår spetsfavorit. En bra segerchans.",
      skor: "C C",
      vagn: "Amerikansk",
    },
    {
      horse: "Global Escape h5",
      kusk: "Örjan Kihlström",
      v75: "12%",
      trend: "+1.97",
      vOdds: "13.06",
      trainer: "Daniel Wäjersten",
      tips: "Har fått tre lopp i kroppen och formen är stigande. Kan öppna bra. En outsider här.",
      skor: "C C",
      vagn: "Vanlig",
    },
    {
      horse: "West Wind r5",
      kusk: "Per Lennartsson",
      v75: "2%",
      trend: "-0.85",
      vOdds: "28.32",
      trainer: "Robert Dunder",
      tips: "Fick ett perfekt lopp senast och avslutade bra till seger. Tuffare emot här.",
      skor: "C C",
      vagn: "Vanlig",
    },
    {
      horse: "Timeless Sunset v7",
      kusk: "Robert Dunder",
      v75: "1%",
      trend: "+0.00",
      vOdds: "185.00",
      trainer: "Robert Dunder",
      tips: "Håller skaplig formen men möter klart tuffare hästar i det här loppet. Rankas ned.",
      skor: "C C",
      vagn: "Vanlig",
    },
    {
      horse: "Wings Level r7",
      kusk: "Magnus A Djuse",
      v75: "8%",
      trend: "-1.24",
      vOdds: "5.50",
      trainer: "Mattias Djuse",
      tips: "Har fått tre lopp efter uppehåll och formen bör vara bättre nu. Får ej glömmas bort.",
      skor: "C C",
      vagn: "Amerikansk",
    },
    {
      horse: "Bollinger Bishop v6",
      kusk: "Sandra Eriksson",
      v75: "1%",
      trend: "-0.44",
      vOdds: "13.47",
      trainer: "Maria Bodin",
      tips: "Avslutade godkänt senast. Kliver dock upp rejält motståndsmässigt här. Vinner inte.",
      skor: "C C",
      vagn: "Amerikansk",
    },
    {
      horse: "Global Crusader h7",
      kusk: "Henrik Svensson",
      v75: "2%",
      trend: "-0.16",
      vOdds: "46.34",
      trainer: "Henrik Svensson",
      tips: "Höll starkt i comebacken senast. Kan öppna bra och lär laddas från start. Skrällbud.",
      skor: "C C",
      vagn: "Vanlig",
    },
    {
      horse: "Fetter Tir v8",
      kusk: "Troels Andersen",
      v75: "3%",
      trend: "-0.57",
      vOdds: "40.55",
      trainer: "Troels Andersen",
      tips: "Har visat fin form en längre tid. Vann enklare senast. Läget sänker chansen. Om många.",
      skor: "C C",
      vagn: "Vanlig",
    },
    {
      horse: "Ruger v7",
      kusk: "Erik Lindegren",
      v75: "1%",
      trend: "-0.82",
      vOdds: "35.00",
      trainer: "Erik Lindegren",
      tips: "Kan en del i grunden. Har nu ett lopp i kroppen. Gynnas av överpace. Svårt ändå.",
      skor: "C C",
      vagn: "Amerikansk",
    },
    {
      horse: "Competivo v5",
      kusk: "Daniel Wäjersten",
      v75: "24%",
      trend: "+1.65",
      vOdds: "12.47",
      trainer: "Daniel Wäjersten",
      tips: "Avslutade väldigt bra över upploppet senast. Hoppas på rätt inledningstempo. Motbud.",
      skor: "C C",
      vagn: "Amerikansk",
    },
    {
      horse: "Bettle Hanover v7",
      kusk: "Mats E Djuse",
      v75: "13%",
      trend: "-0.84",
      vOdds: "8.74",
      trainer: "Lars Wikström",
      tips: "Har gjort flera fina prestationer under vintern. Småjobbig startposition. Outsider.",
      skor: "C C",
      vagn: "Amerikansk",
    },
    {
      horse: "Cubalibre Jet h7",
      kusk: "Wilhelm Paal",
      v75: "25%",
      trend: "+0.40",
      vOdds: "9.12",
      trainer: "Wilhelm Paal",
      tips: "Håller absolut toppform. Vann trots att han fick gå utvändigt om ledaren senast. Bud.",
      skor: "C C",
      vagn: "Amerikansk",
    },
  ];

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-6">
      {/* Header / Title */}
      <h2 className="text-xl font-bold mb-2">
        Avdelning 5, imorgon 17:50
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Bergsåker • 2140 m • Autostart
      </p>

      {/* Actual table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700 text-left border-b border-gray-200">
            <tr>
              <th className="py-2 px-2 font-semibold w-12">#</th>
              <th className="py-2 px-2 font-semibold">Häst / Kusk</th>
              <th className="py-2 px-2 font-semibold">V75%</th>
              <th className="py-2 px-2 font-semibold">Trend%</th>
              <th className="py-2 px-2 font-semibold">V-Odds</th>
              <th className="py-2 px-2 font-semibold">Tränare</th>
              <th className="py-2 px-2 font-semibold">Tipskommentar</th>
              <th className="py-2 px-2 font-semibold">Skor</th>
              <th className="py-2 px-2 font-semibold">Vagn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const trendColor = getTrendColorClass(row.trend);
              return (
                <tr
                  key={i}
                  className="border-b last:border-b-0 border-gray-200 hover:bg-gray-50"
                >
                  {/* The number on the left (1–12) */}
                  <td className="py-2 px-2 font-medium">
                    {i + 1}
                  </td>
                  {/* Häst / Kusk */}
                  <td className="py-2 px-2 whitespace-pre-line">
                    <div className="font-medium">{row.horse}</div>
                    <div className="text-gray-600 text-xs">{row.kusk}</div>
                  </td>
                  {/* V75% */}
                  <td className="py-2 px-2">
                    {row.v75}
                  </td>
                  {/* Trend% */}
                  <td className={`py-2 px-2 ${trendColor}`}>
                    {row.trend}
                  </td>
                  {/* V-Odds */}
                  <td className="py-2 px-2">
                    {row.vOdds}
                  </td>
                  {/* Tränare */}
                  <td className="py-2 px-2">
                    {row.trainer}
                  </td>
                  {/* Tipskommentar */}
                  <td className="py-2 px-2">
                    {row.tips}
                  </td>
                  {/* Skor */}
                  <td className="py-2 px-2">
                    {row.skor}
                  </td>
                  {/* Vagn */}
                  <td className="py-2 px-2">
                    {row.vagn}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Avdelning5Table;
