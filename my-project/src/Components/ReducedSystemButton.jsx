import React from "react";

export default function ProfessionalButton() {
  const handleClick = () => {
    alert("https://travanalyserver-latest.onrender.com/s1?id=1");
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-orange-600 text-white font-semibold rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 transition-colors"
    >
      Tryck för att få reducerat system
    </button>
  );
}