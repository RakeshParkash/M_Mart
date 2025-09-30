// import React, { useEffect, useState } from 'react';
// import { useCookies } from 'react-cookie';
// import { Link } from 'react-router-dom';
// import api from '../utils/api';

// function OrderItem({ order, date }) {
//   return (
//     <div className="bg-white rounded-xl shadow p-4 mb-4 border flex flex-col md:flex-row items-center gap-4">
//       <div className="flex-1 min-w-[150px]">
//         <h3 className="text-lg font-bold text-blue-900">{order.name}</h3>
//         <p className="text-sm text-gray-500">
//           Quantity: <span className="font-semibold">{order.quantity}</span>
//         </p>
//         <div className="mt-1 text-base text-green-700 font-semibold">
//           ₹{order.totalPrice}
//         </div>
//         <div className="text-xs text-gray-400">
//           {date ? new Date(date).toLocaleDateString() : ""}
//         </div>
//         {order.advancePaid != null && (
//           <div className="text-xs text-blue-700 mt-1">
//             Advance Paid: ₹{order.advancePaid}
//           </div>
//         )}
//         {order.status && (
//           <span className={`px-3 py-1 rounded-full font-semibold text-xs 
//             ${order.status === 'Delivered'
//               ? 'bg-green-100 text-green-700'
//               : order.status === 'Pending'
//               ? 'bg-yellow-100 text-yellow-700'
//               : 'bg-gray-100 text-gray-600'
//             }`}>
//             {order.status}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// function OrderSection({ title, orders }) {
//   if (!orders.length)
//     return (
//       <div className="text-center text-gray-500 py-8">
//         No {title.toLowerCase()}.
//       </div>
//     );
//   return (
//     <div className="space-y-4">
//       {orders.map((orderGroup, idx) => (
//         <div key={idx}>
//           <div className="font-bold text-blue-700 mb-2 text-sm">
//             {orderGroup.date && new Date(orderGroup.date).toLocaleDateString()}
//           </div>
//           {orderGroup.items.map((item, i) => (
//             <OrderItem key={i} order={item} date={orderGroup.date} />
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// }

// function Order() {
//   const [cookies] = useCookies(['token']);
//   const [currentOrders, setCurrentOrders] = useState([]);
//   const [historyOrders, setHistoryOrders] = useState([]);
//   const [allOrders, setAllOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [tab, setTab] = useState('current'); // Tabs: current, history, all

//   useEffect(() => {
//     async function fetchOrders() {
//       setLoading(true);
//       setError('');
//       try {
//         const current = await api.get('/orders/current', { headers: { Authorization: `Bearer ${cookies.token}` } });
//         setCurrentOrders(current.data.orders || []);
//         const history = await api.get('/orders/history', { headers: { Authorization: `Bearer ${cookies.token}` } });
//         setHistoryOrders(history.data.orders || []);
//         const all = await api.get('/orders', { headers: { Authorization: `Bearer ${cookies.token}` } });
//         setAllOrders(all.data.orders || []);
//       } catch (err) {
//         setError('Failed to load orders.');
//       }
//       setLoading(false);
//     }
//     fetchOrders();
//   }, [cookies.token]);

//   return (
//     <div className="max-w-[900px] mx-auto min-h-screen px-4 md:px-8 py-12 md:py-16 font-montserrat text-[#333] bg-gradient-to-br from-[#f9f9f9] to-[#fff]">
//       <h1 className="text-3xl font-bold text-blue-900 mb-10 text-center">Your Orders</h1>
//       {/* Tabs */}
//       <div className="flex justify-center gap-6 mb-8">
//         <button
//           className={`px-6 py-2 rounded-full font-semibold transition ${tab === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700'}`}
//           onClick={() => setTab('current')}
//         >
//           Current Orders
//         </button>
//         <button
//           className={`px-6 py-2 rounded-full font-semibold transition ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700'}`}
//           onClick={() => setTab('history')}
//         >
//           Order History
//         </button>
//         <button
//           className={`px-6 py-2 rounded-full font-semibold transition ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700'}`}
//           onClick={() => setTab('all')}
//         >
//           All Orders
//         </button>
//       </div>
//       {loading ? (
//         <div className="text-center text-blue-700 py-20">Loading your orders...</div>
//       ) : error ? (
//         <div className="text-center text-red-700 py-20">{error}</div>
//       ) : (
//         <div>
//           {tab === 'current' && <OrderSection title="Current Orders" orders={currentOrders} />}
//           {tab === 'history' && <OrderSection title="Order History" orders={historyOrders} />}
//           {tab === 'all' && <OrderSection title="All Orders" orders={allOrders} />}
//         </div>
//       )}
//       <div className="mt-10 text-center">
//         <Link to="/categories" className="text-blue-600 underline font-semibold">
//           Shop more products
//         </Link>
//       </div>
//     </div>
//   );
// }

// export default Order;

import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function OrderItem({ order, date }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border flex flex-col md:flex-row items-center gap-4">
      <div className="flex-1 min-w-[150px]">
        <h3 className="text-lg font-bold text-blue-900">{order.name}</h3>
        <p className="text-sm text-gray-500">
          Quantity: <span className="font-semibold">{order.quantity}</span>
        </p>
        <div className="mt-1 text-base text-green-700 font-semibold">
          ₹{order.price}
        </div>
        <div className="text-xs text-gray-400">
          {date ? new Date(date).toLocaleDateString() : ""}
        </div>
        {order.status && (
          <span className={`px-3 py-1 rounded-full font-semibold text-xs 
            ${order.status === 'Delivered'
              ? 'bg-green-100 text-green-700'
              : order.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
            }`}>
            {order.status}
          </span>
        )}
      </div>
    </div>
  );
}

function OrderSection({ title, orders }) {
  if (!orders.length)
    return (
      <div className="text-center text-gray-500 py-8">
        No {title.toLowerCase()}.
      </div>
    );
  return (
    <div className="space-y-4">
      {orders.map((orderGroup, idx) => (
        <div key={idx}>
          <div className="font-bold text-blue-700 mb-2 text-sm">
            {orderGroup.date && new Date(orderGroup.date).toLocaleDateString()}
          </div>
          {orderGroup.items.map((item, i) => (
            <OrderItem key={i} order={item} date={orderGroup.date} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Order() {
  const [cookies] = useCookies(['token']);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('current'); // Tabs: current, history, all

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError('');
      try {
        const all = await api.get('/orders', { headers: { Authorization: `Bearer ${cookies.token}` } });
        setAllOrders(all.data.orders || []);
      } catch (err) {
        setError('Failed to load orders.');
      }
      setLoading(false);
    }
    fetchOrders();
  }, [cookies.token]);

  // Filter orders by status for tabs
  const currentOrders = allOrders.filter(order => order.status === "Placed" || order.status === "Processing");
  const historyOrders = allOrders.filter(order => order.status === "Delivered" || order.status === "Cancelled");

  return (
    <div className="max-w-[900px] mx-auto min-h-screen px-4 md:px-8 py-12 md:py-16 font-montserrat text-[#333] bg-gradient-to-br from-[#f9f9f9] to-[#fff]">
      <h1 className="text-3xl font-bold text-blue-900 mb-10 text-center">Your Orders</h1>
      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-semibold transition ${tab === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700'}`}
          onClick={() => setTab('current')}
        >
          Current Orders
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700'}`}
          onClick={() => setTab('history')}
        >
          Order History
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-700'}`}
          onClick={() => setTab('all')}
        >
          All Orders
        </button>
      </div>
      {loading ? (
        <div className="text-center text-blue-700 py-20">Loading your orders...</div>
      ) : error ? (
        <div className="text-center text-red-700 py-20">{error}</div>
      ) : (
        <div>
          {tab === 'current' && <OrderSection title="Current Orders" orders={currentOrders} />}
          {tab === 'history' && <OrderSection title="Order History" orders={historyOrders} />}
          {tab === 'all' && <OrderSection title="All Orders" orders={allOrders} />}
        </div>
      )}
      <div className="mt-10 text-center">
        <Link to="/categories" className="text-blue-600 underline font-semibold">
          Shop more products
        </Link>
      </div>
    </div>
  );
}

export default Order;