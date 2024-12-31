import React from 'react';

const Swish = () => {
  const handleSwishPayment = () => {
    // Create the JSON object that the Swish app expects
    const swishData = {
      version: 1,
      payeeAlias: "46703776228",
      amount: 100,
      currency: "SEK",       
      callbackUrl: "https://travanalys.onrender.com/"
    };

    // Convert the object to a JSON string
    const jsonString = JSON.stringify(swishData);

    // Base64-encode the JSON string
    const base64EncodedData = btoa(jsonString);

    // Construct the Swish URL
    const swishUrl = `swish://payment?data=${base64EncodedData}`;

    // Redirect user to the Swish app (works on mobile if Swish is installed)
    window.location.href = swishUrl;
  };

  return (
    <div className="text-center pb-4 mt-3">
      <button
        onClick={handleSwishPayment}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-14 rounded"
      >
        Donera via Swish
      </button>
    </div>
  );
};

export default Swish;
