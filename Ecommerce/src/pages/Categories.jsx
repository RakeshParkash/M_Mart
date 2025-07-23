import React, { useEffect, useState } from "react";
import api from "../utils/api";

// Utility: Map product model to UI props
const mapProduct = (product) => ({
  name: product.name,
  desc: product.description,
  img: product.image,
  price: product.selling_Price ? `₹${product.selling_Price.price}/${product.selling_Price.unit}` : "",
});

export default function CategoryBrowser() {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setCategoryData([]);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-600">Loading categories...</div>;
  if (!categoryData.length) return <div className="p-12 text-center text-gray-600">No products found.</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Browse Products by Category
      </h1>

      <div className="max-w-7xl mx-auto space-y-16">
        {categoryData.map(({ category, products }) => (
          <section key={category} className="bg-white rounded-2xl shadow-md border p-6">
            {/* Category header */}
            <div className="mb-6 border-b pb-2 flex items-center justify-between flex-wrap gap-2">
              <span className="text-2xl font-semibold text-blue-800">{category}</span>
              <span className="text-gray-500 text-sm">({products.length} items)</span>
            </div>

            {/* Product cards */}
            {products.length === 0 ? (
              <div className="text-gray-400 italic">No products in this category.</div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
                {products.map((product) => {
                  const item = mapProduct(product);
                  return (
                    <div
                      key={item.name}
                      className="bg-[#f9fafc] rounded-xl border border-gray-200 shadow-sm flex flex-col items-center p-4"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-20 h-20 rounded-full object-cover mb-3 shadow"
                      />
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-1">{item.desc}</p>
                        <p className="text-green-700 font-bold text-sm mb-2">{item.price}</p>
                      </div>
                      <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full font-medium transition">
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
