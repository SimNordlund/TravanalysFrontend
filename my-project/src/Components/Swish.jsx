import React from 'react';

const SwishPaymentButton = () => {
  const handleSwishPayment = () => {
    // Create the JSON object the Swish app expects
    const swishData = {
      version: 1,
      payee: '46703776228',    // Replace the leading '0' with '46'
      amount: '100',
      currency: 'SEK',         // Include currency
      message: 'Payment for order #1234'
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
    <button
      onClick={handleSwishPayment}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Pay with Swish
    </button>
  );
};

export default SwishPaymentButton;
