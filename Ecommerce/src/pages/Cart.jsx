import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function CartItem({ item, onRemove, onUpdateQuantity }) {
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
        >
          -
        </button>
        <span className="px-3 py-1 border rounded bg-gray-50 text-lg font-bold">{quantity}</span>
        <button
          className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-300 text-lg font-bold"
          onClick={() => onUpdateQuantity(item, quantity + 1)}
        >
          +
        </button>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => onRemove(item)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition"
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
  const navigate = useNavigate();

  // Fetch cart data
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

  // Remove item from cart
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

  // Update quantity
  const handleUpdateQuantity = async (item, newQuantity) => {
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
    } catch {
      setError('Failed to update quantity.');
    }
    setUpdating(false);
  };

  // Calculate total
  const total = cart.reduce(
    (sum, item) =>
      sum +
      (item.quantity * (item.product?.selling_Price?.price || item.product?.price || 0)),
    0
  );

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
    <div className="
      max-w-[900px] mx-auto min-h-screen
      px-4 md:px-8 py-12 md:py-16
      font-montserrat text-[#333]
      bg-gradient-to-br from-[#f9f9f9] to-[#fff]
    ">
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
              />
            ))}
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-bold text-green-700">
              Total: ₹{total.toLocaleString()}
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-semibold text-lg shadow transition"
              disabled={updating}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;