import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function CategoryBrowser() {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState({});
  const [wishlisting, setWishlisting] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await api.get("/products/categories");
        const catArray = Object.entries(res.data).map(([category, products]) => ({
          category,
          products,
        }));
        setCategoryData(catArray);
      } catch (e) {
        console.error("Failed to fetch:", e);
        setCategoryData([]);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  const handleAddToCart = async (productId) => {
    setAdding((prev) => ({ ...prev, [productId]: true }));
    try {
      await api.post("/cart", { productId, quantity: 1 });
      // Optionally: Show toast or feedback
    } catch (e) {
      alert("Failed to add to cart.");
    }
    setAdding((prev) => ({ ...prev, [productId]: false }));
  };

  const handleAddToWishlist = async (productId) => {
    setWishlisting((prev) => ({ ...prev, [productId]: true }));
    try {
      await api.post("/wishlist", { productId });
      // Optionally: Show toast or feedback
    } catch (e) {
      alert("Failed to add to wishlist.");
    }
    setWishlisting((prev) => ({ ...prev, [productId]: false }));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-blue-700 font-bold">
        <Icon icon="line-md:loading-twotone-loop" className="text-4xl mr-4" />
        Loading categories...
      </div>
    );
  if (!categoryData.length)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        No products found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2f7] py-10 px-2 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-blue-900 tracking-tight">
          Shop by Category
        </h1>
        <div className="space-y-14">
          {categoryData.map(({ category, products }) => (
            <section key={category} className="bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
              {/* Category Header */}
              <div className="mb-8 border-b pb-3 flex items-center justify-between flex-wrap gap-2">
                <span className="text-2xl font-bold text-blue-900">{category}</span>
                <span className="text-gray-500 text-base">({products.length} items)</span>
              </div>

              {/* Product Cards */}
              {products.length === 0 ? (
                <div className="text-gray-400 italic text-center py-10">No products in this category.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {products.map((product, index) => (
                    <div
                      key={product._id || `${product.name}-${index}`}
                      className="bg-gradient-to-tr from-[#f7fafc] to-[#e8f0fe] rounded-2xl border border-blue-100 shadow-md flex flex-col p-4 hover:-translate-y-1 hover:shadow-xl transition"
                    >
                      {/* Product Image */}
                      <div className="flex justify-center items-center mb-3">
                        <img
                          src={product.img || product.image}
                          alt={product.name}
                          className="w-36 h-36 object-contain rounded-xl bg-white shadow"
                        />
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 text-center">
                        <h3 className="text-lg font-bold text-blue-900 mb-1">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{product.desc}</p>
                        <div className="text-green-700 font-bold text-xl mb-1">
                          {product.price?.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-gray-500">{product.quantity_Unit}</span>
                        </div>
                        {product.selling_Price && (
                          <div className="text-sm text-gray-500">
                            Selling Price: {product.selling_Price.price} / {product.selling_Price.unit}
                          </div>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="mt-4 flex items-center justify-center gap-4">
                        <button
                          className={`flex items-center gap-1 px-2 py-2 rounded-full font-semibold transition
                            ${adding[product._id] ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"} text-white shadow`}
                          onClick={() => handleAddToCart(product._id)}
                          disabled={adding[product._id]}
                        >
                          <Icon icon="mdi:cart-plus" className="text-xl" />
                          {adding[product._id] ? "Adding..." : "Add to Cart"}
                        </button>
                        <button
                          className={`flex items-center gap-1 px-4 py-2 rounded-full font-semibold transition
                            ${wishlisting[product._id] ? "bg-pink-200" : "bg-pink-500 hover:bg-pink-600"} text-white shadow`}
                          onClick={() => handleAddToWishlist(product._id)}
                          disabled={wishlisting[product._id]}
                        >
                          <Icon icon="mdi:heart-outline" className="text-xl" />
                          {wishlisting[product._id] ? "Adding..." : "Wishlist"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}