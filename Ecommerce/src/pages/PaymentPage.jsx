import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GenPaymentComponent from '../components/shared/GenPaymentComponent';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const total = location?.state?.total ?? 0;

  const [publisherKey, setPublisherKey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleResult = ({ success, invoice, error }) => {
    if (success) {
      // navigate to confirmation with invoice
      navigate('/checkout/confirm', { state: { success: true, invoice } });
    } else {
      navigate('/checkout/confirm', { state: { success: false, error } });
    }
  };

  return (
    <div className="max-w-[900px] mx-auto min-h-screen px-4 md:px-8 py-12 md:py-16 font-montserrat">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Checkout — Payment</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Publisher Key</label>
        <input
          value={publisherKey}
          onChange={(e) => setPublisherKey(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Enter publisher key"
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">Secret Key</label>
        <input
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter secret key"
        />
      </div>

      <GenPaymentComponent
        total={total}
        publisherKey={publisherKey}
        secretKey={secretKey}
        onResult={handleResult}
      />
    </div>
  );
}

export default PaymentPage;
