import React from "react";
import { PaperClipIcon } from '@heroicons/react/20/solid';

export default function ProfessionalButton() {
  const handleDownload = async (id) => {
    try {
      const response = await fetch(`https://travanalyserver-latest.onrender.com/s1?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch the XML content");
      }

      const xmlContent = await response.text();

      const blob = new Blob([xmlContent], { type: "text/xml" });
      const url = window.URL.createObjectURL(blob);


      const a = document.createElement("a");
      a.href = url;
      a.download = `reducerat-system-${id}.xml`; 
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a); 


      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error fetching or downloading the file:", error);
      alert(`Failed to download the XML file for ID ${id}. Please try again.`);
    }
  };

  const handleCopyUrl = async (id) => {
    const url = `https://travanalyserver-latest.onrender.com/s1?id=${id}`; 
    try {
      await navigator.clipboard.writeText(url);
      alert(`URL för system ${id} är kopierad!`);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      alert(`Failed to copy the URL for ID ${id}.`);
    }
  };

  const buttonIds = [10, 11, 12, 13, 14, 15, 16];

  return (
    <div className="text-center mb-16 mt-12">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl mt-16 mb-6">Reducerade System</h2> 
      {buttonIds.map((id) => (
        <div key={id} className="m-2 inline-block">
          <button
            onClick={() => handleDownload(id)}
            className="flex items-center justify-center px-10 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 transition-colors m-2 mt-4"
          >
            <PaperClipIcon aria-hidden="true" className="w-5 h-5 mr-2 text-gray-200" />
            Ladda ner reducerad fil {id}
          </button>
          <button
            onClick={() => handleCopyUrl(id)}
            className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors m-2 mb-6"
          >
            Kopiera URL för reducerat system {id}
          </button>
        </div>
      ))}
    </div>
  );
}
