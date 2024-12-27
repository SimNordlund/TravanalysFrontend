import React from 'react';

const SwishPaymentButton = () => {
  const handleSwishPayment = () => {
    // Create the JSON object the Swish app expects
    const swishData = {
      version: 1,
      payee: '46703776228',  // The phone number/Swish number
      amount: '100',        // Amount in SEK
      message: 'Payment for order #1234'
    };

    // Convert the JSON to a string
    const jsonString = JSON.stringify(swishData);
    // Base64-encode the string (btoa = “browser to ASCII base64”)
    const base64EncodedData = btoa(jsonString);

    // Construct the final Swish URL
    // NOTE: "payment" not "paymentrequest", since we’re sending raw JSON data
    const swishUrl = `swish://payment?data=${base64EncodedData}`;

    // Redirect the user to the Swish app
    window.location.href = swishUrl;
  };

  return (
    <button
      onClick={handleSwishPayment}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Pay with Swish
    </button>
  );
};

export default SwishPaymentButton;
