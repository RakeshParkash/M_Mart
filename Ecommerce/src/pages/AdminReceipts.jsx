import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function AdminReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ userId: '', amount: '', manualText: '', date: '', image: null });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchReceipts();
    fetchUsers();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await api.get('/admin/receipts');
      setReceipts(res.data.receipts || []);
    } catch (err) {
      toast.error('Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) return toast.error('Please select a user');
    setUploading(true);
    
    const payload = new FormData();
    payload.append('userId', formData.userId);
    payload.append('amount', formData.amount);
    payload.append('manualText', formData.manualText);
    payload.append('date', formData.date || new Date().toISOString());
    if (formData.image) {
      payload.append('image', formData.image);
    }

    try {
      await api.post('/admin/receipts', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Receipt added');
      setIsModalOpen(false);
      setFormData({ userId: '', amount: '', manualText: '', date: '', image: null });
      fetchReceipts();
    } catch (err) {
      toast.error('Failed to add receipt');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this receipt?')) return;
    try {
      await api.delete(`/admin/receipts/${id}`);
      toast.success('Receipt deleted');
      fetchReceipts();
    } catch (err) {
      toast.error('Failed to delete receipt');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-900">Receipts</h1>
          <p className="text-gray-500">Manage business and customer receipts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition"
        >
          <Icon icon="mdi:plus" className="text-xl" />
          Add Receipt
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {r.image ? (
                <img src={r.image} alt="Receipt" className="w-full h-48 object-cover border-b border-gray-100" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  <Icon icon="mdi:receipt-outline" className="text-5xl" />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">
                    {r.user?.firstName} {r.user?.lastName}
                  </h3>
                  <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-sm">
                    ₹{r.amount}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                  <Icon icon="mdi:calendar" />
                  {format(new Date(r.date), 'PPpp')}
                </p>
                {r.manualText && (
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-4 whitespace-pre-wrap">
                    {r.manualText}
                  </div>
                )}
                <div className="flex justify-end border-t pt-3">
                  <button onClick={() => handleDelete(r._id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition">
                    <Icon icon="mdi:delete" className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {receipts.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No receipts found.
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
              <h2 className="text-xl font-bold text-indigo-900">Add New Receipt</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:close" className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Customer</label>
                <select 
                  className="w-full border rounded-lg p-2.5 bg-gray-50"
                  value={formData.userId}
                  onChange={e => setFormData({ ...formData, userId: e.target.value })}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.phone})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Amount (₹)</label>
                  <input 
                    type="number" className="w-full border rounded-lg p-2.5 bg-gray-50" 
                    value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Date</label>
                  <input 
                    type="date" className="w-full border rounded-lg p-2.5 bg-gray-50" 
                    value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Receipt Image</label>
                <input 
                  type="file" accept="image/*" className="w-full border rounded-lg p-2 bg-gray-50" 
                  onChange={handleFileChange} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Manual Note / Text</label>
                <textarea 
                  rows="3" className="w-full border rounded-lg p-2.5 bg-gray-50" 
                  value={formData.manualText} onChange={e => setFormData({ ...formData, manualText: e.target.value })}
                  placeholder="Enter details of items..."
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold">Cancel</button>
                <button type="submit" disabled={uploading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {uploading ? <Icon icon="eos-icons:loading" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
