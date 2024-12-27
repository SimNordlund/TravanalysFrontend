import React, { useState } from 'react';

const SwishPaymentButton = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSwishPayment = async () => {
    setError(null);
    setLoading(true);
    try {
      // 1. Call your backend to create a Swish payment request
      const response = await fetch('/api/swish/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // You can pass any relevant info (amount, orderId, etc.)
          amount: '100',
          message: 'Payment for order #1234'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      // 2. Parse the JSON response from your server
      const data = await response.json();
      // data.token should be the Swish Payment Request token
      const { token } = data;

      if (!token) {
        throw new Error('No token returned from server');
      }

      // 3. Redirect the user to the Swish app
      window.location.href = `swish://paymentrequest?token=${token}`;

    } catch (err) {
      console.error('Swish payment error:', err);
      setError(err.message);
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
      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};

export default SwishPaymentButton;
