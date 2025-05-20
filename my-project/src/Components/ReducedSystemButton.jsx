import React from "react";

export default function ProfessionalButton() {
  const handleDownload = async () => {
    try {
      const response = await fetch("https://travanalyserver-latest.onrender.com/s1?id=1");
      if (!response.ok) {
        throw new Error("Failed to fetch the XML content");
      }

      const xmlContent = await response.text();

  
      const blob = new Blob([xmlContent], { type: "text/xml" });
      const url = window.URL.createObjectURL(blob);


      const a = document.createElement("a");
      a.href = url;
      a.download = "reducerat-system.xml"; 
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a); 


      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error fetching or downloading the file:", error);
      alert("Failed to download the XML file. Please try again.");
    }
  };

  const handleCopyUrl = async () => {
    const url = "https://travanalyserver-latest.onrender.com/s1?id=1"; 
    try {
      await navigator.clipboard.writeText(url);
      alert("URL kopierad!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      alert("Failed to copy the URL.");
    }
  };

  return (
    <div className="text-center m-2">
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 transition-colors m-2"
      >
        Ladda ner reducerad fil
      </button>
      <button
        onClick={handleCopyUrl}
        className="px-4 py-2 bg-orange-600 text-white font-semibold rounded shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-opacity-50 transition-colors m-2"
      >
        Kopiera URL för reducerat system
      </button>
    </div>
  );
}
