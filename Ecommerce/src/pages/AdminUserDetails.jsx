import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');
  
  // Products Data for Dropdown
  const [products, setProducts] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);

  // Modals State
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', date: '', items: [] });
  const [addModal, setAddModal] = useState({ isOpen: false, type: '', date: new Date().toISOString().split('T')[0], items: [] });
  
  // Quick Add Product Modal State
  const [newProductModal, setNewProductModal] = useState({ 
    isOpen: false, 
    sourceModal: null, // 'add' or 'edit'
    itemIndex: null,
    form: { name: '', category: '', quantity_Unit: '', baseUnit: '', stockValue: 1, sellingPrice: 0 }
  });
  
  // Receive Payment Modal State
  const [receivePaymentModal, setReceivePaymentModal] = useState({ isOpen: false, amount: '' });
  
  const fetchData = async () => {
    try {
      // Fetch users and products concurrently
      const [usersRes, productsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/products')
      ]);
      
      const found = usersRes.data.users.find(u => u._id === id);
      if (found) {
        setUser(found);
      } else {
        toast.error('User not found');
        navigate('/admin/users');
      }

      let prods = [];
      if (Array.isArray(productsRes.data)) prods = productsRes.data;
      else if (Array.isArray(productsRes.data.products)) prods = productsRes.data.products;
      
      setProducts(prods);
      setUniqueCategories([...new Set(prods.map(p => p.category).filter(Boolean))]);

    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlyUser = async () => {
    try {
      const res = await api.get('/admin/users');
      const found = res.data.users.find(u => u._id === id);
      if (found) setUser(found);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  // --- DUES ACTIONS ---
  const handleClearDues = async () => {
    if (!window.confirm("Are you sure you want to mark ALL dues as fully paid? This will backup the current state.")) return;
    try {
      const res = await api.post(`/admin/user/${id}/dues/clear`);
      toast.success(res.data.message);
      fetchOnlyUser();
    } catch (err) {
      toast.error('Failed to clear dues');
    }
  };

  const handleUndoDues = async () => {
    try {
      const res = await api.post(`/admin/user/${id}/dues/undo-clear`);
      toast.success(res.data.message);
      fetchOnlyUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to undo');
    }
  };

  const handleReceivePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!receivePaymentModal.amount || Number(receivePaymentModal.amount) <= 0) return toast.error("Enter a valid amount");
    
    try {
      const res = await api.post(`/admin/user/${id}/receive-payment`, { amount: receivePaymentModal.amount });
      toast.success(res.data.message);
      setReceivePaymentModal({ isOpen: false, amount: '' });
      fetchOnlyUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payment');
    }
  };

  // --- SHARED CALCULATION HELPER ---
  const autoCalculateMath = (newItems, idx, field, value) => {
    // If the user changed the product name OR the quantity, try to recalculate
    if (field === 'name' || field === 'quantity') {
      const currentName = field === 'name' ? value : newItems[idx].name;
      const currentQty = field === 'quantity' ? value : newItems[idx].quantity;
      
      const product = products.find(p => p.name === currentName);
      if (product && product.selling_Price?.price) {
        const calculatedPrice = product.selling_Price.price * currentQty;
        if ('totalPrice' in newItems[idx]) newItems[idx].totalPrice = calculatedPrice;
        if ('dueAmount' in newItems[idx] && !('totalPrice' in newItems[idx])) newItems[idx].dueAmount = calculatedPrice;
      }
    }

    // Auto calculate dueAmount from totalPrice and advancePaid if applicable
    if ('dueAmount' in newItems[idx] && 'totalPrice' in newItems[idx]) {
      const total = Number(field === 'totalPrice' ? value : (newItems[idx].totalPrice || 0));
      const advance = Number(field === 'advancePaid' ? value : (newItems[idx].advancePaid || 0));
      newItems[idx].dueAmount = Math.max(0, total - advance);
      
      // Auto-check fully paid if due is 0 and there is a total
      if (total > 0 && newItems[idx].dueAmount === 0) {
        newItems[idx].fullyPaid = true;
      } else if (newItems[idx].dueAmount > 0) {
        newItems[idx].fullyPaid = false;
      }
    }

    return newItems;
  };

  // --- EDIT MODAL LOGIC ---
  const openEditModal = (type, date, items) => {
    setEditModal({ isOpen: true, type, date, items: JSON.parse(JSON.stringify(items)) });
  };

  const handleEditItemChange = (idx, field, value) => {
    let newItems = [...editModal.items];
    newItems[idx][field] = value;
    newItems = autoCalculateMath(newItems, idx, field, value);
    setEditModal({ ...editModal, items: newItems });
  };

  const handleRemoveItem = (idx) => {
    const newItems = [...editModal.items];
    newItems.splice(idx, 1);
    setEditModal({ ...editModal, items: newItems });
  };

  const saveEditModal = async () => {
    try {
      await api.put(`/admin/user/${id}/history/${editModal.type}/${editModal.date}`, { items: editModal.items });
      toast.success('History updated successfully');
      setEditModal({ isOpen: false, type: '', date: '', items: [] });
      fetchOnlyUser();
    } catch (err) {
      toast.error('Failed to update history');
    }
  };

  // --- ADD MODAL LOGIC ---
  const openAddModal = (type) => {
    setAddModal({
      isOpen: true,
      type,
      date: new Date().toISOString().split('T')[0],
      items: [
        type === 'purchase'
          ? { name: '', quantity: 1, totalPrice: 0, advancePaid: 0 }
          : { name: '', quantity: 1, totalPrice: 0, advancePaid: 0, dueAmount: 0, fullyPaid: false }
      ]
    });
  };

  const handleAddItemBlock = () => {
    const newItem = addModal.type === 'purchase'
      ? { name: '', quantity: 1, totalPrice: 0, advancePaid: 0 }
      : { name: '', quantity: 1, totalPrice: 0, advancePaid: 0, dueAmount: 0, fullyPaid: false };
    setAddModal({ ...addModal, items: [...addModal.items, newItem] });
  };

  const handleAddModalChange = (idx, field, value) => {
    let newItems = [...addModal.items];
    newItems[idx][field] = value;
    newItems = autoCalculateMath(newItems, idx, field, value);
    setAddModal({ ...addModal, items: newItems });
  };

  const handleAddModalRemove = (idx) => {
    const newItems = [...addModal.items];
    newItems.splice(idx, 1);
    setAddModal({ ...addModal, items: newItems });
  };

  const submitAddModal = async () => {
    if (!addModal.date) return toast.error("Date is required");
    if (addModal.items.length === 0) return toast.error("Add at least one item");
    
    for (const item of addModal.items) {
      if (!item.name.trim()) return toast.error("All items must have a product selected");
    }

    try {
      const endpoint = addModal.type === 'purchase' ? `/admin/user/${id}/purchase` : `/admin/user/${id}/due`;
      await api.post(endpoint, { date: addModal.date, items: addModal.items });
      toast.success(`${addModal.type === 'purchase' ? 'Purchase' : 'Due'} added successfully`);
      setAddModal({ isOpen: false, type: '', date: '', items: [] });
      fetchOnlyUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    }
  };

  // --- QUICK ADD PRODUCT LOGIC ---
  const openNewProductModal = (sourceModal, itemIndex) => {
    setNewProductModal({
      isOpen: true,
      sourceModal,
      itemIndex,
      form: { name: '', category: uniqueCategories[0] || 'Uncategorized', quantity_Unit: '1 unit', baseUnit: 'piece', stockValue: 1, sellingPrice: 0 }
    });
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    const { name, category, quantity_Unit, baseUnit, stockValue, sellingPrice } = newProductModal.form;
    
    const payload = {
      name,
      category,
      description: 'Quick added from User Details page',
      quantity_Unit,
      baseUnit,
      stock: { type: 'packet', value: Number(stockValue), unit: baseUnit },
      selling_Price: { price: Number(sellingPrice), unit: baseUnit },
      variants: []
    };

    try {
      const res = await api.post("/admin/product", payload);
      const newlyCreatedProduct = res.data.product || res.data;
      
      // Update global products list
      setProducts([...products, newlyCreatedProduct]);
      
      // Auto-select in the source modal
      const idx = newProductModal.itemIndex;
      if (newProductModal.sourceModal === 'add') {
        handleAddModalChange(idx, 'name', name);
      } else if (newProductModal.sourceModal === 'edit') {
        handleEditItemChange(idx, 'name', name);
      }
      
      toast.success("Product created and selected!");
      setNewProductModal({ ...newProductModal, isOpen: false });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Icon icon="eos-icons:loading" className="text-4xl animate-spin" /></div>;
  if (!user) return null;

  // Calculate Totals
  const totalSpent = user.purchased_history?.reduce((sum, ph) => 
    sum + ph.items.reduce((acc, item) => acc + (item.totalPrice || 0), 0)
  , 0) || 0;

  const totalDue = user.dues?.reduce((sum, dueEntry) => 
    sum + dueEntry.items.reduce((acc, item) => acc + (item.fullyPaid ? 0 : (item.dueAmount || 0)), 0)
  , 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-indigo-900 text-white p-6 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-2 text-indigo-200 hover:text-white mb-4 transition">
          <Icon icon="mdi:arrow-left" /> Back to Users
        </button>
        <h1 className="text-3xl md:text-4xl font-extrabold">{user.firstName} {user.lastName}</h1>
        <p className="text-indigo-200 mt-1 flex items-center gap-4 text-sm md:text-base">
          <span><Icon icon="mdi:phone" className="inline mr-1" /> {user.phone}</span>
          {user.email && <span><Icon icon="mdi:email" className="inline mr-1" /> {user.email}</span>}
        </p>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('purchases')} 
            className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${activeTab === 'purchases' ? 'bg-emerald-500 text-white shadow-emerald-500/50' : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700 hover:text-white'}`}
          >
            <Icon icon="mdi:shopping-outline" className="text-xl" /> Purchase History
          </button>
          <button 
            onClick={() => setActiveTab('dues')} 
            className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${activeTab === 'dues' ? 'bg-rose-500 text-white shadow-rose-500/50' : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700 hover:text-white'}`}
          >
            <Icon icon="mdi:alert-circle-outline" className="text-xl" /> Active Dues
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* PURCHASES SECTION */}
        {activeTab === 'purchases' && (
          <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-10 animate-fade-in">
            <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
                <Icon icon="mdi:shopping-outline" className="text-3xl" /> Purchase History
              </h2>
              <button 
                onClick={() => openAddModal('purchase')}
                className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition flex justify-center items-center gap-2"
              >
                <Icon icon="mdi:plus-circle" className="text-xl" /> Add Purchase
              </button>
            </div>
            
            <div className="p-4 md:p-6 space-y-6">
              {!user.purchased_history || user.purchased_history.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Icon icon="mdi:cart-outline" className="text-6xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No purchases recorded yet.</p>
                </div>
              ) : (
                user.purchased_history.map((ph, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-200 transition-colors">
                    <div className="bg-gray-50 p-3 px-4 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <Icon icon="mdi:calendar" className="text-emerald-500" /> 
                        {ph.date}
                      </span>
                      <button 
                        onClick={() => openEditModal('purchased_history', ph.date, ph.items)} 
                        className="text-emerald-700 hover:text-emerald-900 text-sm font-bold flex items-center gap-1 bg-emerald-100/50 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Icon icon="mdi:pencil" /> Edit 
                      </button>
                    </div>
                    <div className="p-0">
                      {ph.items.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b last:border-0 hover:bg-emerald-50/20 transition-colors">
                          <div className="mb-3 sm:mb-0">
                            <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                            <p className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</p>
                          </div>
                          <div className="grid grid-cols-2 sm:flex items-center gap-3 sm:gap-6 w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                            <div className="text-center sm:text-right">
                              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Total</p>
                              <p className="font-black text-gray-800 text-lg">₹{item.totalPrice}</p>
                            </div>
                            <div className="text-center sm:text-right border-l sm:border-0 pl-3 sm:pl-0 border-gray-200">
                              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Paid</p>
                              <p className="font-black text-emerald-600 text-lg">₹{item.advancePaid}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* DUES SECTION */}
        {activeTab === 'dues' && (
          <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
            <div className="bg-rose-50 border-b border-rose-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-rose-900 flex items-center gap-2">
                  <Icon icon="mdi:alert-circle-outline" className="text-3xl" /> Active Dues
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-wrap">
                <button 
                  onClick={() => setReceivePaymentModal({ isOpen: true, amount: '' })}
                  className="flex-1 sm:flex-none bg-green-600 text-white px-5 py-2 rounded-xl font-bold shadow-md hover:bg-green-700 transition flex justify-center items-center gap-2"
                >
                  <Icon icon="mdi:cash-register" className="text-xl" /> Receive Payment
                </button>
                <button onClick={handleUndoDues} className="flex-1 sm:flex-none bg-white text-rose-700 border border-rose-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-rose-100 transition flex justify-center items-center gap-2">
                  <Icon icon="mdi:undo" /> Undo
                </button>
                <button onClick={handleClearDues} className="flex-1 sm:flex-none bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-rose-50 transition flex justify-center items-center gap-2">
                  <Icon icon="mdi:check-all" /> Clear All
                </button>
                <button 
                  onClick={() => openAddModal('due')}
                  className="flex-1 sm:flex-none bg-rose-600 text-white px-5 py-2 rounded-xl font-bold shadow-md hover:bg-rose-700 transition flex justify-center items-center gap-2"
                >
                  <Icon icon="mdi:plus-circle" className="text-xl" /> Add Due
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 space-y-6">
              {!user.dues || user.dues.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Icon icon="mdi:check-circle-outline" className="text-6xl text-emerald-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No dues recorded. All clear!</p>
                </div>
              ) : (
                user.dues.map((dueEntry, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:border-rose-200 transition-colors">
                    <div className="bg-gray-50 p-3 px-4 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <Icon icon="mdi:calendar" className="text-rose-500" /> 
                        {dueEntry.date}
                      </span>
                      <button 
                        onClick={() => openEditModal('dues', dueEntry.date, dueEntry.items)} 
                        className="text-rose-700 hover:text-rose-900 text-sm font-bold flex items-center gap-1 bg-rose-100/50 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Icon icon="mdi:pencil" /> Edit 
                      </button>
                    </div>
                    <div className="p-0">
                      {dueEntry.items.map((item, i) => (
                        <div key={i} className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b last:border-0 transition-colors ${item.fullyPaid ? 'bg-green-50/40 opacity-75' : 'hover:bg-rose-50/20'}`}>
                          <div className="mb-3 sm:mb-0">
                            <p className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</p>
                            <p className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end sm:gap-6 w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Due Amount</span>
                              <span className={`font-black text-xl ${item.fullyPaid ? 'text-green-600' : 'text-rose-600'}`}>
                                ₹{item.dueAmount}
                              </span>
                            </div>
                            <div className="border-l border-gray-200 pl-4 ml-2">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${item.fullyPaid ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                                {item.fullyPaid ? 'Paid' : 'Unpaid'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

      </div>

      {/* Sticky Bottom Totals (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgb(0,0,0,0.05)] z-40 p-4 md:p-6 transition-transform">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Spent</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-600 leading-none">₹{totalSpent}</p>
          </div>
          <div className="text-right border-l border-gray-200 pl-6">
            <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Due</p>
            <p className="text-2xl md:text-3xl font-black text-rose-600 leading-none">₹{totalDue}</p>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {addModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className={`p-6 border-b border-gray-100 flex justify-between items-center rounded-t-3xl ${addModal.type === 'purchase' ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
              <h2 className={`text-2xl font-bold capitalize flex items-center gap-2 ${addModal.type === 'purchase' ? 'text-emerald-900' : 'text-rose-900'}`}>
                <Icon icon={addModal.type === 'purchase' ? 'mdi:shopping' : 'mdi:alert-circle'} /> 
                Add New {addModal.type}
              </h2>
              <button onClick={() => setAddModal({ isOpen: false, type: '', date: '', items: [] })} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm">
                <Icon icon="mdi:close" className="text-2xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Record Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-indigo-500 outline-none font-medium text-gray-900 bg-white"
                  value={addModal.date} 
                  onChange={e => setAddModal({ ...addModal, date: e.target.value })} 
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-bold text-gray-800">Items List</h3>
                  <button onClick={handleAddItemBlock} className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                    + Add Item
                  </button>
                </div>

                {addModal.items.map((item, idx) => (
                  <div key={idx} className="relative border border-gray-200 p-5 rounded-2xl bg-gray-50/50 shadow-sm">
                    {addModal.items.length > 1 && (
                      <button 
                        onClick={() => handleAddModalRemove(idx)} 
                        className="absolute -top-3 -right-3 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-full shadow-md transition"
                      >
                        <Icon icon="mdi:delete" className="text-lg" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product</label>
                        <div className="flex gap-2">
                          <select 
                            className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
                            value={item.name} 
                            onChange={e => handleAddModalChange(idx, 'name', e.target.value)}
                          >
                            <option value="" disabled>-- Select a Product --</option>
                            {products.map(p => <option key={p._id} value={p.name}>{p.name} (₹{p.selling_Price?.price})</option>)}
                          </select>
                          <button 
                            onClick={() => openNewProductModal('add', idx)}
                            className="bg-indigo-100 hover:bg-indigo-600 text-indigo-700 hover:text-white px-3 rounded-lg font-bold transition flex items-center justify-center flex-shrink-0"
                            title="Create New Product"
                          >
                            <Icon icon="mdi:plus" className="text-xl" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                        <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.quantity} onChange={e => handleAddModalChange(idx, 'quantity', Number(e.target.value))} />
                      </div>
                      
                      {addModal.type === 'purchase' ? (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Price</label>
                            <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.totalPrice} onChange={e => handleAddModalChange(idx, 'totalPrice', Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Advance Paid</label>
                            <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.advancePaid} onChange={e => handleAddModalChange(idx, 'advancePaid', Number(e.target.value))} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Price</label>
                            <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.totalPrice || ''} onChange={e => handleAddModalChange(idx, 'totalPrice', Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Advance Paid</label>
                            <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.advancePaid || ''} onChange={e => handleAddModalChange(idx, 'advancePaid', Number(e.target.value))} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Amount</label>
                            <input type="number" className="w-full border p-2 rounded-lg bg-gray-100 text-rose-700 font-black focus:ring-2 focus:ring-indigo-500 outline-none" value={item.dueAmount} onChange={e => handleAddModalChange(idx, 'dueAmount', Number(e.target.value))} />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 font-bold text-gray-700 bg-white border p-2 w-full rounded-lg cursor-pointer h-[42px]">
                              <input type="checkbox" className="w-5 h-5 accent-green-600 rounded" checked={item.fullyPaid} onChange={e => handleAddModalChange(idx, 'fullyPaid', e.target.checked)} />
                              Fully Paid
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
              <button onClick={() => setAddModal({ isOpen: false, type: '', date: '', items: [] })} className="px-6 py-2.5 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
                Cancel
              </button>
              <button 
                onClick={submitAddModal} 
                className={`text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition transform active:scale-95 ${addModal.type === 'purchase' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                Submit {addModal.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50 rounded-t-3xl">
              <h2 className="text-2xl font-bold text-indigo-900 capitalize flex items-center gap-2">
                <Icon icon="mdi:pencil-box" /> Edit {editModal.type.replace('_', ' ')}
              </h2>
              <button onClick={() => setEditModal({ isOpen: false, type: '', date: '', items: [] })} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm">
                <Icon icon="mdi:close" className="text-2xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg font-semibold flex items-center gap-2">
                <Icon icon="mdi:calendar" /> Date block: {editModal.date}
              </div>
              
              {editModal.items.map((item, idx) => (
                <div key={idx} className="relative border border-gray-200 p-5 rounded-2xl bg-gray-50/50 shadow-sm">
                  <button 
                    onClick={() => handleRemoveItem(idx)} 
                    className="absolute -top-3 -right-3 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-full shadow-md transition"
                  >
                    <Icon icon="mdi:delete" className="text-lg" />
                  </button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product</label>
                      <div className="flex gap-2">
                        <select 
                          className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
                          value={item.name} 
                          onChange={e => handleEditItemChange(idx, 'name', e.target.value)}
                        >
                          <option value="" disabled>-- Select a Product --</option>
                          {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                          {/* Fallback for legacy items not in DB */}
                          {!products.some(p => p.name === item.name) && item.name && (
                            <option value={item.name}>{item.name} (Legacy)</option>
                          )}
                        </select>
                        <button 
                          onClick={() => openNewProductModal('edit', idx)}
                          className="bg-indigo-100 hover:bg-indigo-600 text-indigo-700 hover:text-white px-3 rounded-lg font-bold transition flex items-center justify-center flex-shrink-0"
                          title="Create New Product"
                        >
                          <Icon icon="mdi:plus" className="text-xl" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                      <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.quantity} onChange={e => handleEditItemChange(idx, 'quantity', Number(e.target.value))} />
                    </div>
                    
                    {editModal.type === 'purchased_history' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Price</label>
                          <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.totalPrice} onChange={e => handleEditItemChange(idx, 'totalPrice', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Advance Paid (Partial Payment)</label>
                          <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.advancePaid} onChange={e => handleEditItemChange(idx, 'advancePaid', Number(e.target.value))} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Price (Legacy optional)</label>
                          <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.totalPrice || ''} onChange={e => handleEditItemChange(idx, 'totalPrice', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Advance Paid (Legacy optional)</label>
                          <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.advancePaid || ''} onChange={e => handleEditItemChange(idx, 'advancePaid', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Amount</label>
                          <input type="number" className="w-full border p-2 rounded-lg bg-gray-100 text-rose-700 font-black focus:ring-2 focus:ring-indigo-500 outline-none" value={item.dueAmount} onChange={e => handleEditItemChange(idx, 'dueAmount', Number(e.target.value))} />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 font-bold text-gray-700 bg-white border p-2 w-full rounded-lg cursor-pointer h-[42px]">
                            <input type="checkbox" className="w-5 h-5 accent-green-600 rounded" checked={item.fullyPaid} onChange={e => handleEditItemChange(idx, 'fullyPaid', e.target.checked)} />
                            Fully Paid
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {editModal.items.length === 0 && (
                <div className="text-center text-gray-400 py-6 italic border-2 border-dashed border-gray-200 rounded-xl">
                  No items left in this block. Saving will clear this date.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
              <button onClick={() => setEditModal({ isOpen: false, type: '', date: '', items: [] })} className="px-6 py-2.5 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
                Cancel
              </button>
              <button onClick={saveEditModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition transform active:scale-95">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD PRODUCT MODAL (Layered on top of other modals) */}
      {newProductModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border-2 border-indigo-200">
            <div className="bg-indigo-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Icon icon="mdi:package-variant-plus" className="text-2xl" /> Quick Add Product
              </h3>
              <button onClick={() => setNewProductModal({ ...newProductModal, isOpen: false })} className="text-indigo-200 hover:text-white bg-indigo-700/50 rounded-full p-1 transition">
                <Icon icon="mdi:close" className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleQuickAddSubmit} className="p-6 space-y-4 bg-gray-50">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none font-medium text-gray-900 bg-white"
                  value={newProductModal.form.name}
                  onChange={e => setNewProductModal(prev => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <input
                    list="quick-categories-list"
                    className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none font-medium text-gray-900 bg-white"
                    name="category"
                    value={newProductModal.form.category}
                    onChange={e => setNewProductModal(prev => ({ ...prev, form: { ...prev.form, category: e.target.value } }))}
                    placeholder="Select or type new..."
                  />
                  <datalist id="quick-categories-list">
                    {uniqueCategories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Type (e.g. kg/pc)</label>
                  <select 
                    className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none font-medium text-gray-900 bg-white"
                    value={newProductModal.form.baseUnit}
                    onChange={e => setNewProductModal(prev => ({ ...prev, form: { ...prev.form, baseUnit: e.target.value } }))}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="piece">piece</option>
                    <option value="packet">packet</option>
                    <option value="litre">litre</option>
                    <option value="ml">ml</option>
                    <option value="bottle">bottle</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Size/Label <span className="text-gray-400 font-normal">(e.g. 500g, Large)</span></label>
                <input 
                  type="text" required
                  className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none font-medium text-gray-900 bg-white"
                  value={newProductModal.form.quantity_Unit}
                  onChange={e => setNewProductModal(prev => ({ ...prev, form: { ...prev.form, quantity_Unit: e.target.value } }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (₹) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0" step="0.01"
                    className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none font-bold text-emerald-600 bg-white"
                    value={newProductModal.form.sellingPrice}
                    onChange={e => setNewProductModal(prev => ({ ...prev, form: { ...prev.form, sellingPrice: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Stock <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="0"
                    className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-indigo-500 outline-none font-bold text-gray-900 bg-white"
                    value={newProductModal.form.stockValue}
                    onChange={e => setNewProductModal(prev => ({ ...prev, form: { ...prev.form, stockValue: e.target.value } }))}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setNewProductModal({ ...newProductModal, isOpen: false })} className="px-5 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-md transition transform active:scale-95">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVE PAYMENT MODAL */}
      {receivePaymentModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border-2 border-green-200">
            <div className="bg-green-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Icon icon="mdi:cash-multiple" className="text-2xl" /> Receive Payment
              </h3>
              <button onClick={() => setReceivePaymentModal({ isOpen: false, amount: '' })} className="text-green-200 hover:text-white bg-green-700/50 rounded-full p-1 transition">
                <Icon icon="mdi:close" className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleReceivePaymentSubmit} className="p-6 space-y-4 bg-gray-50 text-center">
              <p className="text-gray-600 font-medium mb-4">Enter the total amount paid by the customer. This will automatically deduct from their oldest unpaid dues perfectly!</p>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Amount Received (₹)</label>
                <input 
                  type="number" required min="1" step="0.01"
                  className="w-full border-2 border-green-300 p-4 rounded-xl focus:border-green-600 outline-none font-black text-green-700 text-center text-3xl shadow-inner"
                  placeholder="0.00"
                  value={receivePaymentModal.amount}
                  onChange={e => setReceivePaymentModal({ ...receivePaymentModal, amount: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="pt-4 flex justify-between gap-3 mt-4">
                <button type="button" onClick={() => setReceivePaymentModal({ isOpen: false, amount: '' })} className="flex-1 px-5 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 text-lg">
                  <Icon icon="mdi:check-circle" /> Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
