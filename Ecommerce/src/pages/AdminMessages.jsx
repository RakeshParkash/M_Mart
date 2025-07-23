import { useEffect, useState } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch messages from backend
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/contact/messages');
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.error || 'Failed to load messages');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchMessages}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Messages</h1>
      
      {messages.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message._id} className="bg-white p-5 rounded-lg shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{message.name}</h3>
                  <p className="text-gray-600">{message.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(message.createdAt), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(message.createdAt), 'h:mm a')}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-700">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}