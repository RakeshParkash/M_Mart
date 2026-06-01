import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ entityType: '', action: '' });
  const [showDelete, setShowDelete] = useState(false);
  const tapCount = useRef(0);
  const tapResetTimer = useRef(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await api.get(`/admin/history?${query}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [filters]);

  const getActionColor = (action) => {
    switch (action) {
      case 'Create': return 'bg-emerald-100 text-emerald-800';
      case 'Update': return 'bg-blue-100 text-blue-800';
      case 'Delete': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTap = () => {
    tapCount.current += 1;
    
    if (tapCount.current >= 5) {
      setShowDelete(prev => {
        const next = !prev;
        toast.info(next ? 'Secret delete unlocked' : 'Secret delete hidden', { icon: '🕵️' });
        return next;
      });
      tapCount.current = 0;
    }

    if (tapResetTimer.current) clearTimeout(tapResetTimer.current);
    tapResetTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1000); // Reset if they stop tapping for 1 second
  };

  const deleteLog = async (id) => {
    if (!window.confirm('Permanently delete this log?')) return;
    try {
      await api.delete(`/admin/history/${id}`);
      toast.success('Log deleted');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to delete log');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 
            className="text-3xl font-extrabold text-gray-900 select-none cursor-pointer"
            onClick={handleTap}
          >
            Activity Logs
          </h1>
          <p className="text-gray-500">Track all changes and CRUD operations</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
            value={filters.entityType} 
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Product">Product</option>
            <option value="Receipt">Receipt</option>
            <option value="CustomList">Custom List</option>
            <option value="Purchase">Purchase</option>
            <option value="Due">Due</option>
          </select>
          <select 
            className="border border-gray-300 rounded-lg p-2 bg-white shadow-sm"
            value={filters.action} 
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="Create">Create</option>
            <option value="Update">Update</option>
            <option value="Delete">Delete</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <Icon icon="eos-icons:loading" className="text-4xl text-gray-400 mx-auto animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">Admin</th>
                  <th className="p-4 font-semibold">Action</th>
                  <th className="p-4 font-semibold">Entity</th>
                  <th className="p-4 font-semibold">Target User</th>
                  <th className="p-4 font-semibold">Details</th>
                  {showDelete && <th className="p-4 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {format(new Date(log.timestamp), 'PP pp')}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-800">
                      {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getActionColor(log.action)}`}>
                        {log.action || log.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-700">
                      {log.entityType || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {log.targetUser ? `${log.targetUser.firstName} ${log.targetUser.lastName}` : '-'}
                    </td>
                    <td className="p-4 text-sm">
                      <details className="cursor-pointer">
                        <summary className="text-indigo-600 hover:text-indigo-800 outline-none font-medium">View Data</summary>
                        <pre className="mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto max-w-xs md:max-w-md">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    </td>
                    {showDelete && (
                      <td className="p-4 text-sm">
                        <button onClick={() => deleteLog(log._id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
                          <Icon icon="mdi:delete" className="text-xl" />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No logs found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
