import React from 'react';

const SwishPaymentButton = () => {
  const handleSwishPayment = () => {
    // Construct the JSON object for Swish
    const swishData = {
      version: 1,
      payee: '0703776228',         // The phone number you want pre-filled
      amount: '100',               // The amount (in SEK)
      message: 'Payment for order Ipa'
    };

    // URL-encode the JSON
    const encodedSwishData = encodeURIComponent(JSON.stringify(swishData));

    // Construct the swish:// URL
    const swishUrl = `swish://payment?data=${encodedSwishData}`;

    // Attempt to open the Swish app
    window.location.href = swishUrl;
  };

  return (
    <button
      onClick={handleSwishPayment}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Donera en ipa
    </button>
  );
};

export default SwishPaymentButton;
