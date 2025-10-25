import React, { useState } from 'react';

/**
 * GenPaymentComponent
 * Props:
 *  - total: number
 *  - onResult: function({ success: boolean, invoice?: object, error?: string })
 *  - publisherKey, secretKey: strings (optional)
 */
export default function GenPaymentComponent({ total = 0, publisherKey = '', secretKey = '', onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    if (!publisherKey || !secretKey) {
      setError('Publisher and Secret keys are required to proceed.');
      return;
    }
    setLoading(true);
    // Simulate contacting a payment provider
    await new Promise((r) => setTimeout(r, 900));

    // Simple deterministic mock: if secretKey contains "fail" then fail
    if (secretKey.toLowerCase().includes('fail')) {
      const errmsg = 'Payment provider rejected the credentials or transaction.';
      setError(errmsg);
      setLoading(false);
      if (onResult) onResult({ success: false, error: errmsg });
      return;
    }

    // Mock success invoice
    const invoice = {
      id: `INV-${Date.now()}`,
      total,
      date: new Date().toISOString(),
      publisherKeyMasked: publisherKey.slice(0, 4) + '...' + publisherKey.slice(-4),
    };

    setLoading(false);
    if (onResult) onResult({ success: true, invoice });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <div className="mb-4 text-lg font-semibold">Payment Summary</div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-600">Grand total</div>
        <div className="text-2xl font-bold text-green-700">₹{total.toLocaleString()}</div>
      </div>

      {error && <div className="mb-4 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end">
        <button
          disabled={loading}
          onClick={handleGenerate}
          className={`px-6 py-2 rounded-full font-semibold text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-800'}`}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}
