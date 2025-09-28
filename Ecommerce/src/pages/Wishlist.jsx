import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

function WishlistItem({ item, onRemove, onAddToCart, updating }) {
  const { product } = item;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-xl shadow p-4 mb-4 border">
      <img
        src={product?.image || product?.img}
        alt={product?.name}
        className="w-24 h-24 object-contain rounded-lg bg-gray-50"
      />
      <div className="flex-1 min-w-[150px]">
        <h3 className="text-lg font-bold text-pink-900">{product?.name}</h3>
        <p className="text-sm text-gray-500">{product?.description || product?.desc}</p>
        <div className="mt-1 text-base text-green-700 font-semibold">
          ₹{product?.selling_Price?.price || product?.price} / {product?.selling_Price?.unit || product?.quantity_Unit}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <button
          onClick={() => onAddToCart(item)}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-800 transition font-semibold"
          disabled={updating}
        >
          Add to Cart
        </button>
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

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/wishlist');
        setWishlist(data.wishlist || []);
      } catch (err) {
        setError('Failed to load wishlist.');
        setWishlist([]);
      }
      setLoading(false);
    }
    fetchWishlist();
  }, []);

  const handleRemove = async (item) => {
    setUpdating(true);
    try {
      await api.delete(`/wishlist/${item.product._id}`);
      setWishlist((prev) => prev.filter(wi => wi.product._id !== item.product._id));
    } catch {
      setError('Failed to remove item.');
    }
    setUpdating(false);
  };

  const handleAddToCart = async (item) => {
    setUpdating(true);
    try {
      await api.post('/cart', { productId: item.product._id, quantity: 1 });
      await api.delete(`/wishlist/${item.product._id}`); // Optionally remove from wishlist after adding
      setWishlist((prev) => prev.filter(wi => wi.product._id !== item.product._id));
    } catch {
      setError('Failed to add to cart.');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto min-h-screen px-4 md:px-16 py-24 text-center text-pink-700 font-bold text-2xl">
        Loading your wishlist...
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
      <h1 className="text-3xl font-bold text-pink-900 mb-10 text-center">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center text-lg text-gray-600 py-16">
          <div className="mb-4 text-4xl">💖</div>
          Your wishlist is empty.<br />
          <Link to="/categories" className="text-pink-600 underline font-semibold">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div>
            {wishlist.map((item, idx) => (
              <WishlistItem
                key={item.product._id || idx}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
                updating={updating}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Wishlist;