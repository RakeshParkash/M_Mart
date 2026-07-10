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
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  function defaultForm() {
    return {
      name: "",
      description: "",
      quantity_Unit: "",
      baseUnit: "",
      image: "",
      stock: { type: "packet", value: 1, unit: "" },
      selling_Price: { price: 0, unit: "" },
      buying_Price: { price: 0, unit: "" },
      category: "",
      variants: []
    };
  }

  const getProducts = async () => {
    setFetching(true);
    try {
      const { data } = await api.get("/admin/products");
      if (Array.isArray(data)) setProducts(data);
      else if (Array.isArray(data.products)) setProducts(data.products);
      else setProducts([]);
    } catch (err) {
      setError("Could not load products");
      setProducts([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleForm = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("stock.")) {
      setForm((prev) => ({ ...prev, stock: { ...prev.stock, [name.split(".")[1]]: value } }));
    } else if (name.startsWith("selling_Price.") || name.startsWith("buying_Price.")) {
      const [key, subKey] = name.split(".");
      setForm((prev) => ({ ...prev, [key]: { ...prev[key], [subKey]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { label: "", price: 0, unit: prev.quantity_Unit || "" }]
    }));
  };

  const removeVariant = (index) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setForm(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        stock: { ...form.stock, value: Number(form.stock.value), unit: form.baseUnit },
        selling_Price: { price: Number(form.selling_Price.price), unit: form.baseUnit },
        buying_Price: form.buying_Price?.price ? { price: Number(form.buying_Price.price), unit: form.baseUnit } : undefined,
        variants: form.variants.map(v => ({ ...v, price: Number(v.price), unit: form.baseUnit }))
      };
      if (editing) await api.put(`/admin/product/${editing._id}`, payload);
      else await api.post("/admin/product", payload);
      
      setModalOpen(false);
      setForm(defaultForm());
      setEditing(null);
      getProducts();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to save product");
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
      baseUnit: prod.stock?.unit || "",
      selling_Price: { ...prod.selling_Price },
      buying_Price: prod.buying_Price ? { ...prod.buying_Price } : { price: 0, unit: "" },
      stock: { ...prod.stock },
      variants: prod.variants ? [...prod.variants] : []
    });
    setModalOpen(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm(defaultForm());
    setModalOpen(true);
  };

  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueUnits = ["kg", "g", "litre", "ml", "packet", "piece", "bottle", "box", "dozen"];

  return (
    <div className="min-h-screen bg-gradient-to-br text-black from-sky-50 to-white p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-4xl font-bold text-blue-900 tracking-tight">Product Catalogue</h2>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-200 rounded-xl p-1 shadow-inner">
              <button onClick={() => setViewMode("grid")} className={`px-4 py-2 rounded-lg font-semibold transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>Grid</button>
              <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg font-semibold transition ${viewMode === 'list' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>List</button>
            </div>
            <button
              onClick={startAdd}
              className="flex gap-2 items-center px-6 py-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-400 text-white text-lg font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 active:scale-95 transition cursor-pointer"
            >
              <span className="text-2xl">+</span> Add Product
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 rounded-xl p-4 mb-6 text-lg font-semibold">{error}</div>}

        {fetching ? (
          <div className="text-center text-2xl text-blue-700 py-10 flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             Loading products...
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {products.map((prod) => (
                  <div key={prod._id} className="bg-white/80 backdrop-blur-md border border-white/40 shadow-xl hover:shadow-2xl rounded-3xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 group">
                    <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl flex items-center justify-center mb-5 overflow-hidden h-48 p-4 relative group-hover:scale-[1.02] transition-transform duration-300">
                      {prod.image ? <img src={prod.image} className="max-h-full max-w-full object-contain drop-shadow-md" alt={prod.name} /> : <div className="text-gray-400 font-semibold text-sm">No Image</div>}
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-indigo-700 font-bold px-3 py-1 rounded-full text-xs shadow-sm">{prod.category}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{prod.name}</h3>
                      {prod.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{prod.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock</span>
                        <div className="text-xl font-bold text-gray-900">
                          {prod.stock?.value} <span className="text-sm font-semibold text-gray-500">{prod.quantity_Unit}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pricing</span>
                        <div className="text-xl font-extrabold text-green-600 tracking-tight">
                          ₹{prod.selling_Price?.price} <span className="text-sm font-bold text-gray-500">/ {prod.quantity_Unit}</span>
                        </div>
                      </div>
                    </div>
                    {prod.variants?.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Variants</span>
                        <div className="flex flex-wrap gap-2">
                          {prod.variants.map((v, idx) => (
                             <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-semibold border border-blue-100">
                               {v.label} - ₹{v.price}/{v.unit}
                             </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-auto flex gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => startEdit(prod)} className="flex-1 cursor-pointer py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors text-sm font-bold shadow-sm">Edit</button>
                      <button onClick={() => window.open(`/admin/product/${prod._id}`, "_blank")} className="flex-1 cursor-pointer py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white rounded-xl transition-colors text-sm font-bold shadow-sm">Details</button>
                      <button onClick={() => deleteProduct(prod._id)} className="cursor-pointer px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors text-sm font-bold">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="p-4 font-bold tracking-wide">Product</th>
                        <th className="p-4 font-bold tracking-wide">Category</th>
                        <th className="p-4 font-bold tracking-wide">Stock</th>
                        <th className="p-4 font-bold tracking-wide">Sell Price</th>
                        <th className="p-4 font-bold tracking-wide">Variants</th>
                        <th className="p-4 font-bold tracking-wide text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(prod => (
                        <tr key={prod._id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            {prod.image ? <img src={prod.image} alt={prod.name} className="h-12 w-12 object-contain rounded-lg border border-gray-100 shadow-sm bg-white p-1" /> : <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">N/A</div>}
                            <span className="font-bold text-gray-900">{prod.name}</span>
                          </td>
                          <td className="p-4"><span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold">{prod.category}</span></td>
                          <td className="p-4 font-bold text-gray-800">{prod.stock?.value} <span className="text-gray-500 font-medium">{prod.quantity_Unit}</span></td>
                          <td className="p-4"><span className="text-green-600 font-extrabold">₹{prod.selling_Price?.price}</span> <span className="text-gray-500 font-bold text-sm">/ {prod.quantity_Unit}</span></td>
                          <td className="p-4">
                            {prod.variants?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {prod.variants.map((v, idx) => (
                                  <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 font-bold whitespace-nowrap">
                                    {v.label}: ₹{v.price}
                                  </span>
                                ))}
                              </div>
                            ) : <span className="text-gray-400 text-xs">-</span>}
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button onClick={() => startEdit(prod)} className="text-indigo-600 font-bold hover:text-indigo-900 transition text-sm">Edit</button>
                            <button onClick={() => deleteProduct(prod._id)} className="text-red-500 font-bold hover:text-red-700 transition text-sm">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 sm:p-6"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={(e) => {
              // Only close if clicking exactly on the backdrop
              if (e.target === e.currentTarget) {
                setModalOpen(false); setEditing(null);
              }
            }}
          >
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl relative max-h-[95vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-3xl font-extrabold mb-8 text-blue-900 flex items-center gap-3">
                {editing ? "✏️ Edit Product" : "➕ Add New Product"}
              </h3>
              <button
                type="button"
                onClick={() => { setModalOpen(false); setEditing(null); }}
                className="absolute right-6 top-6 text-gray-400 hover:bg-gray-100 hover:text-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-colors cursor-pointer"
              >✕</button>

              <form onSubmit={submitForm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                    <input
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition outline-none"
                      name="name" value={form.name} onChange={handleForm} required
                      placeholder="e.g. Premium Basmati Rice"
                    />
                  </div>

                  {/* Category using Datalist */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                    <input
                      list="categories-list"
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition outline-none"
                      name="category" value={form.category} onChange={handleForm} required
                      placeholder="Select or type new..."
                    />
                    <datalist id="categories-list">
                      {uniqueCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  {/* Base Unit */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Base Unit (Pricing/Stock) <span className="text-red-500">*</span></label>
                    <select
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition outline-none bg-white"
                      name="baseUnit" value={form.baseUnit} onChange={handleForm} required
                    >
                      <option value="">Select Unit (e.g. bottle, packet)</option>
                      {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1 font-medium">This applies to stock and pricing automatically.</p>
                  </div>

                  {/* Main Product Size */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Main Product Size/Label <span className="text-red-500">*</span></label>
                    <input
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition outline-none bg-white"
                      name="quantity_Unit" value={form.quantity_Unit} onChange={handleForm} required
                      placeholder="e.g. 1 L, 500 g, Large"
                    />
                    <p className="text-xs text-gray-400 mt-1 font-medium">The size of the main (default) product.</p>
                  </div>

                  {/* Stock Setup */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <div className="col-span-2 text-sm font-bold text-gray-700">Stock Details</div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                      <select
                        name="stock.type" value={form.stock.type} onChange={handleForm}
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 outline-none font-medium bg-white"
                      >
                        <option value="packet">Packet</option>
                        <option value="weight">Weight</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Total Quantity in Stock</label>
                      <input
                        name="stock.value" value={form.stock.value} onChange={handleForm} type="number" min={0} step="any"
                        className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 outline-none font-bold"
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                      />
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Selling Price <span className="text-red-500">*</span></label>
                    <div className="relative w-full">
                      <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                      <input
                        name="selling_Price.price" value={form.selling_Price.price} onChange={handleForm} type="number" min={0} step="any" required
                        className="w-full border-2 border-gray-200 p-3 pl-8 rounded-xl focus:border-blue-500 outline-none font-bold text-gray-900 bg-white"
                        onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>

                  {/* Buying Price (Optional) */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Buying Price <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                    <div className="relative w-full">
                      <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                      <input
                        name="buying_Price.price" value={form.buying_Price?.price || ''} onChange={handleForm} type="number" min={0} step="any"
                        className="w-full border-2 border-gray-200 p-3 pl-8 rounded-xl focus:border-blue-500 outline-none font-bold text-gray-900 bg-white"
                        placeholder="e.g. 40"
                      />
                    </div>
                  </div>

                  {/* Variants (Dynamic) */}
                  <div className="md:col-span-2 border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-bold text-gray-800">Variants / Sizes <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                      <button type="button" onClick={addVariant} className="text-sm bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-200 transition">
                        + Add Variant
                      </button>
                    </div>
                    {form.variants.length > 0 && (
                      <div className="space-y-3">
                        {form.variants.map((variant, idx) => (
                          <div key={idx} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex-[2]">
                              <input
                                placeholder="Label (e.g. 500g, Large)"
                                value={variant.label} onChange={(e) => handleVariantChange(idx, 'label', e.target.value)} required
                                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 outline-none font-medium"
                              />
                            </div>
                            <div className="flex-1 relative">
                              <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                              <input
                                placeholder="Price"
                                type="number" step="any" min={0} value={variant.price} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} required
                                className="w-full border-2 border-gray-200 p-3 pl-8 rounded-lg focus:border-blue-500 outline-none font-bold"
                              />
                            </div>
                            <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 bg-red-50 w-12 h-12 rounded-lg flex items-center justify-center hover:bg-red-100 transition font-bold text-xl" title="Remove Variant">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description (Optional) */}
                  <div className="md:col-span-2 pt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                    <textarea
                      name="description" value={form.description} onChange={handleForm} rows={3}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition outline-none"
                    ></textarea>
                  </div>

                  {/* Image URL (Optional) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Image URL <span className="text-gray-400 font-normal text-xs">(Optional)</span></label>
                    <input
                      name="image" value={form.image} onChange={handleForm} type="url"
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition outline-none"
                    />
                    {form.image && (
                      <div className="mt-3 bg-gray-50 p-2 rounded-xl inline-block border border-gray-200">
                        <img src={form.image} alt="Preview" className="h-20 rounded shadow-sm object-contain" />
                      </div>
                    )}
                  </div>

                </div>

                <button
                  type="submit"
                  className="w-full mt-8 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-2xl text-xl font-extrabold active:scale-[0.98] transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {editing ? "Update Product" : "Save New Product"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}