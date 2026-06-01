import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function AdminLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentList, setCurrentList] = useState({ title: '', items: [] });
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await api.get('/admin/lists');
      setLists(res.data.lists || []);
    } catch (err) {
      toast.error('Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentList.title) return toast.error('Title is required');
    try {
      if (currentList._id) {
        await api.put(`/admin/lists/${currentList._id}`, currentList);
        toast.success('List updated');
      } else {
        await api.post('/admin/lists', currentList);
        toast.success('List created');
      }
      setIsModalOpen(false);
      fetchLists();
    } catch (err) {
      toast.error('Failed to save list');
    }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Delete list?')) return;
    try {
      await api.delete(`/admin/lists/${id}`);
      toast.success('List deleted');
      fetchLists();
    } catch (err) {
      toast.error('Failed to delete list');
    }
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setCurrentList({
      ...currentList,
      items: [...currentList.items, { text: newItemText, completed: false }]
    });
    setNewItemText('');
  };

  const removeItem = (idx) => {
    const newItems = [...currentList.items];
    newItems.splice(idx, 1);
    setCurrentList({ ...currentList, items: newItems });
  };

  const toggleItem = async (list, itemIdx) => {
    const updatedList = { ...list };
    updatedList.items[itemIdx].completed = !updatedList.items[itemIdx].completed;
    try {
      await api.put(`/admin/lists/${list._id}`, updatedList);
      fetchLists();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Custom Lists</h1>
          <p className="text-gray-500">Manage daily bills, tasks, or shopping lists</p>
        </div>
        <button
          onClick={() => { setCurrentList({ title: '', items: [] }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition"
        >
          <Icon icon="mdi:plus" className="text-xl" />
          Create List
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div key={list._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
              <div className="bg-blue-50/50 p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{list.title}</h3>
                  <p className="text-xs text-gray-400">{format(new Date(list.createdAt), 'PP')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setCurrentList(list); setIsModalOpen(true); }} className="text-blue-500 p-1 hover:bg-blue-100 rounded">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button onClick={() => handleDeleteList(list._id)} className="text-red-500 p-1 hover:bg-red-100 rounded">
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1">
                <ul className="space-y-2">
                  {list.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <button onClick={() => toggleItem(list, idx)}>
                        <Icon icon={item.completed ? "mdi:checkbox-marked-circle" : "mdi:checkbox-blank-circle-outline"} 
                              className={`text-xl ${item.completed ? 'text-green-500' : 'text-gray-300'}`} />
                      </button>
                      <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                  {list.items.length === 0 && <li className="text-sm text-gray-400 italic">No items</li>}
                </ul>
              </div>
            </div>
          ))}
          {lists.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              No lists found.
            </div>
          )}
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <h2 className="text-xl font-bold text-blue-900">{currentList._id ? 'Edit List' : 'New List'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:close" className="text-2xl" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">List Title</label>
                <input 
                  type="text" className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={currentList.title} onChange={e => setCurrentList({ ...currentList, title: e.target.value })} 
                  placeholder="E.g., Today's Supplies"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Items</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" className="flex-1 border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newItemText} onChange={e => setNewItemText(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    placeholder="Add an item..."
                  />
                  <button onClick={addItem} className="bg-blue-100 text-blue-700 px-4 rounded-lg font-bold hover:bg-blue-200">Add</button>
                </div>
                <ul className="space-y-2 border rounded-lg p-2 bg-gray-50 max-h-60 overflow-y-auto">
                  {currentList.items.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                      <span className="text-sm">{item.text}</span>
                      <button onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Icon icon="mdi:close" />
                      </button>
                    </li>
                  ))}
                  {currentList.items.length === 0 && <div className="text-sm text-gray-400 text-center py-2">List is empty</div>}
                </ul>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-3 border-t bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold">Cancel</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                Save List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
