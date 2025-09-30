
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function CartItem({ item, onRemove, onUpdateQuantity, updating }) {
  const { product, quantity } = item;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-xl shadow p-4 mb-4 border">
      <img
        src={product?.image || product?.img}
        alt={product?.name}
        className="w-24 h-24 object-contain rounded-lg bg-gray-50"
      />
      <div className="flex-1 min-w-[150px]">
        <h3 className="text-lg font-bold text-blue-900">{product?.name}</h3>
        <p className="text-sm text-gray-500">{product?.description || product?.desc}</p>
        <div className="mt-1 text-base text-green-700 font-semibold">
          ₹{product?.selling_Price?.price || product?.price} / {product?.selling_Price?.unit || product?.quantity_Unit}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-300 text-lg font-bold"
          onClick={() => onUpdateQuantity(item, Math.max(1, quantity - 1))}
          disabled={updating || quantity <= 1}
          aria-label="Decrease"
        >
          -
        </button>
        <span className="px-3 py-1 border rounded bg-gray-50 text-lg font-bold">{quantity}</span>
        <button
          className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-300 text-lg font-bold"
          onClick={() => onUpdateQuantity(item, quantity + 1)}
          disabled={updating}
          aria-label="Increase"
        >
          +
        </button>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => onRemove(item)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          disabled={updating}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/cart');
        setCart(data.cart || []);
      } catch (err) {
        setError('Failed to load cart.');
        setCart([]);
      }
      setLoading(false);
    }
    fetchCart();
  }, []);

  const handleRemove = async (item) => {
    setUpdating(true);
    try {
      await api.delete(`/cart/${item.product._id}`);
      setCart((prev) => prev.filter(ci => ci.product._id !== item.product._id));
    } catch {
      setError('Failed to remove item.');
    }
    setUpdating(false);
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1) return;
  if (!item?.product?._id) {
    setError("Invalid product ID.");
    return;
  }
  setUpdating(true);
  try {
    await api.patch(`/cart/${item.product._id}`, { quantity: newQuantity });
    setCart((prev) =>
      prev.map(ci =>
        ci.product._id === item.product._id
          ? { ...ci, quantity: newQuantity }
          : ci
      )
    );
  } catch (err) {
    setError('Failed to update quantity.');
    // Log full error response
    if (err.response) {
      console.error('PATCH /cart/:id error:', err.response.status, err.response.data);
    } else {
      console.error('PATCH /cart/:id error:', err);
    }
  }
  setUpdating(false);
};
  

  const total = cart.reduce(
    (sum, item) =>
      sum +
      (item.quantity * (item.product?.selling_Price?.price || item.product?.price || 0)),
    0
  );

  // --- Order placement handler ---
  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      // You can add address/payment info here if needed
      const { data } = await api.post('/order', { method: "COD" });
      setOrderPlaced(true);
      setShowConfirm(false);
      // Optionally clear cart in frontend
      setCart([]);
      // Optionally redirect to orders page after a delay
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      setError('Failed to place order.');
      setShowConfirm(false);
    }
    setPlacingOrder(false);
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto min-h-screen px-4 md:px-16 py-24 text-center text-blue-700 font-bold text-2xl">
        Loading your cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto min-h-screen px-4 md:px-16 py-24 text-center text-red-700 font-bold text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto min-h-screen px-4 md:px-8 py-12 md:py-16 font-montserrat text-[#333] bg-gradient-to-br from-[#f9f9f9] to-[#fff]">
      <h1 className="text-3xl font-bold text-blue-900 mb-10 text-center">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center text-lg text-gray-600 py-16">
          <div className="mb-4 text-4xl">🛒</div>
          Your cart is empty.<br />
          <Link to="/categories" className="text-blue-600 underline font-semibold">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div>
            {cart.map((item, idx) => (
              <CartItem
                key={item.product._id || idx}
                item={item}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
                updating={updating}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-bold text-green-700">
              Total: ₹{total.toLocaleString()}
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-semibold text-lg shadow transition"
              disabled={updating || placingOrder}
              onClick={() => setShowConfirm(true)}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg min-w-[300px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Confirm Order</h2>
            <p className="mb-2">Total Amount: <span className="font-bold text-green-700">₹{total.toLocaleString()}</span></p>
            <p className="mb-6 text-gray-600">Do you want to place this order for your cart items?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
                onClick={() => setShowConfirm(false)}
                disabled={placingOrder}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white font-semibold"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? "Placing..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {orderPlaced && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center min-w-[300px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Order Placed!</h2>
            <p className="mb-4 text-gray-700">Your order has been placed successfully.</p>
            <button
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-800 text-white font-semibold"
              onClick={() => navigate('/orders')}
            >
              View Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;