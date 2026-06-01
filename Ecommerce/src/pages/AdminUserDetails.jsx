import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit History Modal State
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', date: '', items: [] });
  
  const fetchUser = async () => {
    try {
      // The API only has GET /admin/users which returns all. Let's fetch all and filter, or we can use the PUT response
      // Wait, there is no GET /admin/user/:id! 
      // I need to add one in the backend or fetch all and filter.
      // Actually, adminAuth.js doesn't have a GET single user route. Let's fetch all and find the user.
      const res = await api.get('/admin/users');
      const found = res.data.users.find(u => u._id === id);
      if (found) {
        // Need to refetch completely if we want to ensure we have all fields? The /admin/users route returns:
        // firstName lastName email phone purchased_history dues cart wishlist
        setUser(found);
      } else {
        toast.error('User not found');
        navigate('/admin/users');
      }
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const handleClearDues = async () => {
    if (!window.confirm("Are you sure you want to mark ALL dues as fully paid? This will backup the current state.")) return;
    try {
      const res = await api.post(`/admin/user/${id}/dues/clear`);
      toast.success(res.data.message);
      fetchUser();
    } catch (err) {
      toast.error('Failed to clear dues');
    }
  };

  const handleUndoDues = async () => {
    try {
      const res = await api.post(`/admin/user/${id}/dues/undo-clear`);
      toast.success(res.data.message);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to undo');
    }
  };

  const openEditModal = (type, date, items) => {
    // deep clone items
    setEditModal({ isOpen: true, type, date, items: JSON.parse(JSON.stringify(items)) });
  };

  const handleEditItemChange = (idx, field, value) => {
    const newItems = [...editModal.items];
    newItems[idx][field] = value;
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
      fetchUser();
    } catch (err) {
      toast.error('Failed to update history');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Icon icon="eos-icons:loading" className="text-4xl animate-spin" /></div>;
  if (!user) return null;

  // Calculate Totals
  const totalSpent = user.purchased_history.reduce((sum, ph) => 
    sum + ph.items.reduce((acc, item) => acc + (item.totalPrice || 0), 0)
  , 0);

  const totalDue = user.dues.reduce((sum, dueEntry) => 
    sum + dueEntry.items.reduce((acc, item) => acc + (item.fullyPaid ? 0 : (item.dueAmount || 0)), 0)
  , 0);

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
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid gap-8">
        {/* DUES SECTION */}
        <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-rose-50 border-b border-rose-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-rose-900 flex items-center gap-2">
                <Icon icon="mdi:alert-circle-outline" className="text-3xl" />
                Active Dues
              </h2>
              <p className="text-rose-600 text-sm mt-1">Pending payments and credit history</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handleUndoDues} className="flex-1 md:flex-none bg-white text-rose-700 border border-rose-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-rose-100 transition flex justify-center items-center gap-2">
                <Icon icon="mdi:undo" /> Undo Clear
              </button>
              <button onClick={handleClearDues} className="flex-1 md:flex-none bg-rose-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-rose-700 transition flex justify-center items-center gap-2">
                <Icon icon="mdi:check-all" /> Clear All Dues
              </button>
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            {user.dues.length === 0 ? (
              <p className="text-center text-gray-400 py-8 italic">No dues recorded.</p>
            ) : (
              user.dues.map((dueEntry, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 p-3 px-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-700 flex items-center gap-2">
                      <Icon icon="mdi:calendar" className="text-gray-400" /> 
                      {dueEntry.date}
                    </span>
                    <button 
                      onClick={() => openEditModal('dues', dueEntry.date, dueEntry.items)} 
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-lg transition"
                    >
                      <Icon icon="mdi:pencil" /> Edit Block
                    </button>
                  </div>
                  <div className="p-0">
                    {dueEntry.items.map((item, i) => (
                      <div key={i} className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b last:border-0 ${item.fullyPaid ? 'bg-green-50/30 opacity-70' : ''}`}>
                        <div className="mb-2 sm:mb-0">
                          <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:gap-6 w-full sm:w-auto">
                          <span className={`font-black text-xl ${item.fullyPaid ? 'text-green-600' : 'text-rose-600'}`}>
                            ₹{item.dueAmount}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.fullyPaid ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                            {item.fullyPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PURCHASES SECTION */}
        <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-10">
          <div className="bg-emerald-50 border-b border-emerald-100 p-6">
            <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
              <Icon icon="mdi:shopping-outline" className="text-3xl" />
              Purchase History
            </h2>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            {user.purchased_history.length === 0 ? (
              <p className="text-center text-gray-400 py-8 italic">No purchases recorded.</p>
            ) : (
              user.purchased_history.map((ph, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 p-3 px-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-700 flex items-center gap-2">
                      <Icon icon="mdi:calendar" className="text-gray-400" /> 
                      {ph.date}
                    </span>
                    <button 
                      onClick={() => openEditModal('purchased_history', ph.date, ph.items)} 
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-lg transition"
                    >
                      <Icon icon="mdi:pencil" /> Edit Block
                    </button>
                  </div>
                  <div className="p-0">
                    {ph.items.map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b last:border-0 hover:bg-gray-50">
                        <div className="mb-2 sm:mb-0">
                          <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:flex items-center gap-4 w-full sm:w-auto bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-gray-100">
                          <div className="text-center sm:text-right">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total</p>
                            <p className="font-black text-gray-800">₹{item.totalPrice}</p>
                          </div>
                          <div className="text-center sm:text-right border-l sm:border-0 pl-4 sm:pl-0 border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Paid</p>
                            <p className="font-black text-emerald-600">₹{item.advancePaid}</p>
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
      </div>

      {/* Sticky Bottom Totals (Mobile & Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgb(0,0,0,0.1)] z-40 p-4 md:p-6 transition-transform">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Spent</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-600 leading-none">₹{totalSpent}</p>
          </div>
          <div className="text-right border-l border-gray-200 pl-6">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Due</p>
            <p className="text-2xl md:text-3xl font-black text-rose-600 leading-none">₹{totalDue}</p>
          </div>
        </div>
      </div>

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
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                      <input type="text" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.name} onChange={e => handleEditItemChange(idx, 'name', e.target.value)} />
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
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Advance Paid</label>
                          <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.advancePaid} onChange={e => handleEditItemChange(idx, 'advancePaid', Number(e.target.value))} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Amount</label>
                      <input type="number" className="w-full border p-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" value={item.dueAmount} onChange={e => handleEditItemChange(idx, 'dueAmount', Number(e.target.value))} />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 font-bold text-gray-700 bg-white border p-2 w-full rounded-lg cursor-pointer">
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

    </div>
  );
}
