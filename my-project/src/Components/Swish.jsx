import React from 'react';

const Swish = () => {
  const handleSwishPayment = () => {
    // Create the JSON object the Swish app expects
    const swishData = {
      version: 1,
      payee: '0703776228',    // Replace the leading '0' with '46'
      amount: '10',
      message: 'Payment for order 1234'
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(swishData);

    // Base64-encode the string
    // (If you might have non-ASCII characters, consider a UTF-8 safe approach)
    const base64EncodedData = btoa(jsonString);

    // Construct the Swish URL
    const swishUrl = `swish://payment?data=${base64EncodedData}`;

    // Redirect the user to the Swish app
    window.location.href = swishUrl;
  };

  return (
    <div className="text-center pb-4 mt-3">
    <button
      onClick={handleSwishPayment}
      className=" bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-14 rounded"
    >
      Donera via Swish
    </button>
    </div>
  );
};

export default Swish;
