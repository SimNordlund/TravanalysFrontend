import React from 'react';

const Swish = () => {
  const handleSwishPayment = () => {
    // Create the JSON object that the Swish app expects
    const swishData = {
      version: 1,
      payee: '0703776228',
      amount: '100',
      currency: 'SEK',
      message: 'Test',
      callbackUrl: 'https://travanalys.onrender.com/'
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
        className="bg-indigo-500 hover:bg-indigo-700 text-white font-semibold rounded shadow py-2 px-8 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
      >
        Donera via Swish
      </button>
    </div>
  );
};

export default Swish;
