import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    <span className="text-lg bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl mr-3">
      {stock.value} {stock.unit} ({stock.type})
    </span>
  );
}

export default function AdminDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setFetching(true);
      try {
        const { data } = await api.get(`/admin/product/${id}`);
        setProduct(data);
        setForm({ ...data });
        setFetching(false);
      } catch (err) {
        setError("Could not load product details");
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  const submitEdit = async (e) => {
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
      await api.put(`/admin/product/${id}`, payload);
      setProduct(payload);
      setEditMode(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update product"
      );
    }
  };

  const deleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/product/${id}`);
      navigate("/admin/products");
    } catch {
      setError("Delete failed");
    }
  };

  if (fetching) {
    return <div className="text-center text-2xl text-blue-700 py-10">Loading product details...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-700 py-10">{error}</div>;
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-black p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
          <div className="w-full md:w-64 h-64 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-60 max-w-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-2">{product.description}</p>
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <StockUnit stock={product.stock} />
              <span className="text-base text-gray-600">{product.quantity_Unit}</span>
              <span className="bg-indigo-100 text-blue-700 px-3 rounded-xl text-base ml-auto">{product.category}</span>
            </div>
            <div className="flex flex-wrap gap-6 my-3 text-lg items-center">
              <span className="flex items-center gap-2">
                <span className="text-gray-400">Sells:</span>
                <PriceUnit priceObj={product.selling_Price} highlight />
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gray-400">Buys:</span>
                <PriceUnit priceObj={product.buying_Price} />
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-2 rounded-2xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition shadow"
          >
            ✏️ Edit
          </button>
          <button
            onClick={deleteProduct}
            className="px-6 py-2 rounded-2xl bg-red-600 text-white text-lg font-bold hover:bg-red-700 transition shadow"
          >
            🗑 Delete
          </button>
          <button
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2 rounded-2xl bg-gray-200 text-blue-900 text-lg font-bold hover:bg-gray-300 transition shadow"
          >
            ← Back
          </button>
        </div>

        {/* Edit Mode */}
        {editMode && (
          <form onSubmit={submitEdit} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Product Name</label>
                <input
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="name"
                  value={form.name}
                  onChange={handleForm}
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <input
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="category"
                  value={form.category}
                  onChange={handleForm}
                  required
                  type="text"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="description"
                  value={form.description}
                  onChange={handleForm}
                  rows={3}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Image URL</label>
                <input
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
              <div>
                <label className="block text-sm font-bold mb-2">Quantity Unit</label>
                <input
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="quantity_Unit"
                  value={form.quantity_Unit}
                  onChange={handleForm}
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Stock Type</label>
                <select
                  name="stock.type"
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.stock.type}
                  onChange={handleForm}
                >
                  <option value="packet">Packet</option>
                  <option value="weight">Weight</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Stock Value</label>
                <input
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="stock.value"
                  value={form.stock.value}
                  onChange={handleForm}
                  type="number"
                  min={0}
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Stock Unit</label>
                <input
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="stock.unit"
                  value={form.stock.unit}
                  onChange={handleForm}
                  type="text"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Selling Price</label>
                <input
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="selling_Price.price"
                  value={form.selling_Price.price}
                  onChange={handleForm}
                  type="number"
                  min={0}
                  step="any"
                />
                <input
                  className="w-full border mt-3 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="selling_Price.unit"
                  value={form.selling_Price.unit}
                  onChange={handleForm}
                  type="text"
                  placeholder="Unit (eg. kg/pc/box)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Buying Price</label>
                <input
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="buying_Price.price"
                  value={form.buying_Price.price}
                  onChange={handleForm}
                  type="number"
                  min={0}
                  step="any"
                />
                <input
                  className="w-full border mt-3 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  name="buying_Price.unit"
                  value={form.buying_Price.unit}
                  onChange={handleForm}
                  type="text"
                  placeholder="Unit (eg. kg/pc/box)"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-tr from-blue-700 to-blue-400 hover:from-blue-800 hover:to-blue-600 text-white py-3 rounded-2xl text-xl font-bold active:scale-95 transition cursor-pointer"
            >
              Save Changes
            </button>
            {error && <div className="text-red-500 mt-3 text-center">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}