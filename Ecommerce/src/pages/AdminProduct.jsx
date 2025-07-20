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
      setProducts(data);
      setFetching(false);
    } catch (err) {
      setError("Could not load products");
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
            className="flex gap-1 items-center px-5 py-2 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-bold shadow hover:from-blue-700 hover:to-blue-600 active:scale-95 transition cursor-pointer"
          >
            <span className="text-lg">+</span> Add New Product
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 rounded-md p-3 mb-4">{error}</div>
        )}

        {fetching ? (
          <div className="text-center text-xl text-blue-700">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((prod) => (
              <div
                key={prod._id}
                className="bg-white shadow-xl hover:shadow-2xl rounded-2xl p-5 transition-all hover:-translate-y-1 overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                  <img
                    src={prod.image}
                    className="max-h-[140px] max-w-[220px] object-contain mx-auto"
                    alt={prod.name}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-1 truncate">{prod.name}</h3>
                  <p className="text-gray-600 text-sm mb-1 line-clamp-2">{prod.description}</p>
                </div>
                <div className="flex gap-2 mb-2 mt-1 items-center">
                  <StockUnit stock={prod.stock} />
                  <span className="text-sm text-gray-600">{prod.quantity_Unit}</span>
                  <span className="bg-indigo-100 text-blue-700 px-2 rounded text-xs ml-auto">{prod.category}</span>
                </div>
                <div className="flex gap-4 my-2 text-sm items-center">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Sells:</span>
                    <PriceUnit priceObj={prod.selling_Price} highlight />
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">Buys:</span>
                    <PriceUnit priceObj={prod.buying_Price} />
                  </span>
                </div>
                <div className="mt-auto flex gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => startEdit(prod)}
                    className="cursor-pointer px-2 text-sky-600 hover:bg-sky-50 hover:text-sky-800 rounded transition"
                    aria-label="Edit Product"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(prod._id)}
                    className="cursor-pointer px-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded transition"
                    aria-label="Delete Product"
                  >
                    🗑 Delete
                  </button>
                  <button
                    onClick={() => window.open(`/admin/product/${prod._id}`, "_blank")}
                    className="ml-auto cursor-pointer px-2 text-indigo-500 hover:text-indigo-800 hover:bg-indigo-50 rounded transition"
                  >
                    ℹ️ Details
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
            <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-semibold mb-2 text-blue-800 flex items-center gap-2">
                {editing ? <span>✏️</span> : <span>➕</span>}
                {editing ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                type="button"
                onClick={() => { setModalOpen(false); setEditing(null); }}
                className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 text-2xl leading-tight font-bold cursor-pointer"
                title="Close"
                tabIndex={0}
                aria-label="Close"
              >✕</button>

              <form onSubmit={submitForm} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Product Name</label>
                    <input
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="name"
                      value={form.name}
                      onChange={handleForm}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Category</label>
                    <input
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="category"
                      value={form.category}
                      onChange={handleForm}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1">Description</label>
                    <textarea
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="description"
                      value={form.description}
                      onChange={handleForm}
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Image URL</label>
                    <input
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="image"
                      value={form.image}
                      onChange={handleForm}
                      required
                    />
                    {form.image && (
                      <img src={form.image} alt="Preview" className="h-20 mt-2 mx-auto rounded shadow border" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Quantity Unit</label>
                    <input
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="quantity_Unit"
                      value={form.quantity_Unit}
                      onChange={handleForm}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Stock Type</label>
                    <select
                      name="stock.type"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={form.stock.type}
                      onChange={handleForm}
                    >
                      <option value="packet">Packet</option>
                      <option value="weight">Weight</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Stock Value</label>
                    <input
                      type="number"
                      min={0}
                      name="stock.value"
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={form.stock.value}
                      onChange={handleForm}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Stock Unit</label>
                    <input
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="stock.unit"
                      value={form.stock.unit}
                      onChange={handleForm}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Selling Price</label>
                    <input
                      type="number"
                      min="0"
                      name="selling_Price.price"
                      value={form.selling_Price.price}
                      onChange={handleForm}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      className="w-full border mt-2 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="selling_Price.unit"
                      value={form.selling_Price.unit}
                      onChange={handleForm}
                      placeholder="Unit (eg. kg/pc/box)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Buying Price</label>
                    <input
                      type="number"
                      min="0"
                      name="buying_Price.price"
                      value={form.buying_Price.price}
                      onChange={handleForm}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      className="w-full border mt-2 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      name="buying_Price.unit"
                      value={form.buying_Price.unit}
                      onChange={handleForm}
                      placeholder="Unit (eg. kg/pc/box)"
                    />
                  </div>
                </div>
                <button
                  className="w-full mt-3 bg-gradient-to-tr from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white py-2 rounded-xl text-lg font-bold active:scale-95 transition cursor-pointer"
                  type="submit"
                >{editing ? "Update Product" : "Add Product"}</button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
