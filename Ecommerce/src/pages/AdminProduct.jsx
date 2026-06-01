import { useEffect, useState } from "react";
import api from "../utils/api";

function PriceUnit({ priceObj, highlight }) {
  if (!priceObj) return null;
  return (
    <span className={highlight ? 'font-bold text-emerald-600' : 'text-gray-500'}>
      ₹{priceObj.price} / {priceObj.unit}
    </span>
  );
}

function StockUnit({ stock }) {
  if (!stock) return null;
  return (
    <span className="text-xs bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mr-2">
      {stock.value} {stock.unit} ({stock.type})
    </span>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited
  const [form, setForm] = useState(defaultForm());
  const [error, setError] = useState("");

  function defaultForm() {
    return {
      name: "",
      description: "",
      quantity_Unit: "",
      image: "",
      stock: { type: "packet", value: 1, unit: "unit" },
      selling_Price: { price: 0, unit: "" },
      buying_Price: { price: 0, unit: "" },
      category: "",
    };
  }

  // Fetch all products
  const getProducts = async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/admin/products");
      // Defensive assignment: always set to array, even if response is object
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
      setFetching(false);
    } catch (err) {
      setError("Could not load products");
      setProducts([]); // fallback to empty array to avoid .map error
      setFetching(false);
    }
  };

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line
  }, []);

  // Handle form changes (including nested fields)
  const handleForm = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("stock.")) {
      setForm((prev) => ({
        ...prev,
        stock: { ...prev.stock, [name.split(".")[1]]: value },
      }));
    } else if (name.startsWith("selling_Price.") || name.startsWith("buying_Price.")) {
      const key = name.split(".")[0], subKey = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        [key]: { ...prev[key], [subKey]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        stock: {
          ...form.stock,
          value: Number(form.stock.value),
        },
        selling_Price: {
          price: Number(form.selling_Price.price),
          unit: form.selling_Price.unit,
        },
        buying_Price: {
          price: Number(form.buying_Price.price),
          unit: form.buying_Price.unit,
        },
      };
      if (editing) {
        await api.put(`/admin/product/${editing._id}`, payload);
      } else {
        await api.post("/admin/product", payload);
      }
      setModalOpen(false);
      setForm(defaultForm());
      setEditing(null);
      getProducts();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save product"
      );
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/product/${id}`);
      getProducts();
    } catch {
      setError("Delete failed");
    }
  };

  const startEdit = (prod) => {
    setEditing(prod);
    setForm({
      ...prod,
      selling_Price: { ...prod.selling_Price },
      buying_Price: { ...prod.buying_Price },
      stock: { ...prod.stock },
    });
    setModalOpen(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm(defaultForm());
    setModalOpen(true);
  };

  // UI rendering
  return (
    <div className="min-h-screen bg-gradient-to-br text-black from-sky-50 to-white p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-blue-900 tracking-tight">Product Catalogue</h2>
          <button
            onClick={startAdd}
            className="flex gap-2 items-center px-6 py-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-400 text-white text-lg font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 active:scale-95 transition cursor-pointer"
          >
            <span className="text-2xl">+</span> Add New Product
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6 text-lg font-semibold">{error}</div>
        )}

        {fetching ? (
          <div className="text-center text-2xl text-blue-700 py-10">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.isArray(products) && products.map((prod) => (
              <div
                key={prod._id}
                className="bg-white/80 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl flex items-center justify-center mb-5 overflow-hidden h-48 p-4 relative group-hover:scale-[1.02] transition-transform duration-300">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                      alt={prod.name}
                    />
                  ) : (
                    <div className="text-gray-300 font-semibold">No Image</div>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-indigo-700 font-bold px-3 py-1 rounded-full text-xs shadow-sm">
                    {prod.category}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{prod.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{prod.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Stock</span>
                    <div className="flex items-center gap-1">
                      <StockUnit stock={prod.stock} />
                      <span className="text-xs text-gray-500 font-medium">{prod.quantity_Unit}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pricing</span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 text-xs">Sell:</span>
                        <PriceUnit priceObj={prod.selling_Price} highlight />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 text-xs">Buy:</span>
                        <PriceUnit priceObj={prod.buying_Price} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-auto flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => startEdit(prod)}
                    className="flex-1 cursor-pointer py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors text-sm font-bold shadow-sm"
                    aria-label="Edit Product"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => window.open(`/admin/product/${prod._id}`, "_blank")}
                    className="flex-1 cursor-pointer py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white rounded-xl transition-colors text-sm font-bold shadow-sm"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => deleteProduct(prod._id)}
                    className="cursor-pointer px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors text-sm font-bold"
                    aria-label="Delete Product"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
              style={{ backdropFilter: "blur(3px)" }}
              onClick={() => { setModalOpen(false); setEditing(null); }}
            >
              <div
                className="w-full max-w-xl bg-white rounded-3xl p-10 shadow-3xl relative max-h-[92vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <h3 className="text-3xl font-bold mb-6 text-blue-800 flex items-center gap-3">
                  {editing ? <span>✏️</span> : <span>➕</span>}
                  {editing ? "Edit Product" : "Add New Product"}
                </h3>
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setEditing(null); }}
                  className="absolute right-8 top-6 text-gray-400 hover:text-gray-600 text-3xl leading-tight font-bold cursor-pointer"
                  title="Close"
                  tabIndex={0}
                  aria-label="Close"
                >✕</button>

                {/* Form */}
                <form onSubmit={submitForm} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="name">Product Name</label>
                      <input
                        id="name"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="name"
                        value={form.name}
                        onChange={handleForm}
                        required
                        type="text"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="category">Category</label>
                      <input
                        id="category"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="category"
                        value={form.category}
                        onChange={handleForm}
                        required
                        type="text"
                      />
                    </div>

                    {/* Description (full width) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-2" htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="description"
                        value={form.description}
                        onChange={handleForm}
                        rows={3}
                        required
                      ></textarea>
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="image">Image URL</label>
                      <input
                        id="image"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="image"
                        value={form.image}
                        onChange={handleForm}
                        type="url"
                        required
                      />
                      {form.image && (
                        <img src={form.image} alt="Preview" className="h-20 mt-3 mx-auto rounded-xl shadow border" />
                      )}
                    </div>

                    {/* Quantity Unit */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="quantity_Unit">Quantity Unit</label>
                      <input
                        id="quantity_Unit"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="quantity_Unit"
                        value={form.quantity_Unit}
                        onChange={handleForm}
                        required
                        type="text"
                      />
                    </div>

                    {/* Stock Type */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="stock.type">Stock Type</label>
                      <select
                        id="stock.type"
                        name="stock.type"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={form.stock.type}
                        onChange={handleForm}
                      >
                        <option value="packet">Packet</option>
                        <option value="weight">Weight</option>
                      </select>
                    </div>

                    {/* Stock Value */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="stock.value">Stock Value</label>
                      <input
                        id="stock.value"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="stock.value"
                        value={form.stock.value}
                        onChange={handleForm}
                        type="number"
                        min={0}
                        step="any"
                      />
                    </div>

                    {/* Stock Unit */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="stock.unit">Stock Unit</label>
                      <input
                        id="stock.unit"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="stock.unit"
                        value={form.stock.unit}
                        onChange={handleForm}
                        type="text"
                      />
                    </div>

                    {/* Selling Price */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="selling_Price.price">Selling Price</label>
                      <input
                        id="selling_Price.price"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="selling_Price.price"
                        value={form.selling_Price.price}
                        onChange={handleForm}
                        type="number"
                        min={0}
                        step="any"
                      />
                      <input
                        id="selling_Price.unit"
                        className="w-full border mt-3 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="selling_Price.unit"
                        value={form.selling_Price.unit}
                        onChange={handleForm}
                        type="text"
                        placeholder="Unit (eg. kg/pc/box)"
                      />
                    </div>

                    {/* Buying Price */}
                    <div>
                      <label className="block text-sm font-bold mb-2" htmlFor="buying_Price.price">Buying Price</label>
                      <input
                        id="buying_Price.price"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="buying_Price.price"
                        value={form.buying_Price.price}
                        onChange={handleForm}
                        type="number"
                        min={0}
                        step="any"
                      />
                      <input
                        id="buying_Price.unit"
                        className="w-full border mt-3 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        name="buying_Price.unit"
                        value={form.buying_Price.unit}
                        onChange={handleForm}
                        type="text"
                        placeholder="Unit (eg. kg/pc/box)"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-tr from-blue-700 to-blue-400 hover:from-blue-800 hover:to-blue-600 text-white py-3 rounded-2xl text-xl font-bold active:scale-95 transition cursor-pointer"
                  >
                    {editing ? "Update Product" : "Add Product"}
                  </button>

                  {/* Error Message */}
                  {error && <div className="text-red-500 mt-3 text-center">{error}</div>}
                </form>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}