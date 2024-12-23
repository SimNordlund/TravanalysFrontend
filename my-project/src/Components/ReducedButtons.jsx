import React from "react";
import Marketing from "../Marketing";

export default function ProfessionalButton() {
  const handleDownload = async (id) => {
    try {
      const response = await fetch(`https://travanalyserver-latest.onrender.com/s1?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch the XML content");
      }

      const xmlContent = await response.text();

      // Create a blob with the XML content and a download link
      const blob = new Blob([xmlContent], { type: "text/xml" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to download the file
      const a = document.createElement("a");
      a.href = url;
      a.download = `reducerat-system-${id}.xml`; // Unique filename for each ID
      document.body.appendChild(a); // Append the link to the document
      a.click(); // Programmatically click the link to trigger the download
      document.body.removeChild(a); // Remove the link after downloading

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error fetching or downloading the file:", error);
      alert(`Failed to download the XML file for ID ${id}. Please try again.`);
    }
  };

  const handleCopyUrl = async (id) => {
    const url = `https://travanalyserver-latest.onrender.com/s1?id=${id}`; // The URL to copy
    try {
      await navigator.clipboard.writeText(url);
      alert(`URL för system ${id} är kopierad!`);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      alert(`Failed to copy the URL for ID ${id}.`);
    }
  };

  // Generate buttons for IDs 1 to 5
  const buttonIds = [1, 2, 3, 4, 5];

  return (
    <div className="text-center m-2">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl mt-10 mb-10">Reducerade System</h2>
      {buttonIds.map((id) => (
        <div key={id} className="m-2">
          <button
            onClick={() => handleDownload(id)}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 transition-colors m-2"
          >
            Ladda ner reducerad fil {id}
          </button>
          <button
            onClick={() => handleCopyUrl(id)}
            className="px-4 py-2 bg-orange-600 text-white font-semibold rounded shadow hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-opacity-50 transition-colors m-2"
          >
            Kopiera URL för reducerat system {id}
          </button>
        </div>
      ))}
      <Marketing></Marketing>
    </div>
  );
}
