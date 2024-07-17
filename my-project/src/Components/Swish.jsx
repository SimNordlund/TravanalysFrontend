import React, { useState } from 'react';

const SwishPaymentButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSwishPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.swish.nu/paymentrequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your Swish API authentication headers here
        },
        body: JSON.stringify({
          payeePaymentReference: '1234567890',
          callbackUrl: 'https://your-callback-url.com',
          payeeAlias: '1231181189',
          amount: '100',
          currency: 'SEK',
          message: 'Payment for order #1234',
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }

      const data = await response.json();
      const paymentRequestToken = data.id; // Get the payment request token from the response

      // Construct the Swish URL
      const swishUrl = `swish://paymentrequest?token=${paymentRequestToken}`;

      // Redirect the user to the Swish app
      window.location.href = swishUrl;
    } catch (error) {
      console.error('Error initiating Swish payment:', error);
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSwishPayment}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay with Swish'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default SwishPaymentButton;
