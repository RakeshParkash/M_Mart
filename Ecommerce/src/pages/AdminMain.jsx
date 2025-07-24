import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/shared/AdminButton';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [counts, setCounts] = useState({ users: 0, products: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [csrf, setCSRF] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Get CSRF and profile on mount
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [csrfRes, profileRes] = await Promise.all([
          api.get('/admin/csrf-token'),
          api.get('/admin/me')
        ]);
        setCSRF(csrfRes.data.csrfToken || '');
        setAdmin(profileRes.data.admin);
      } catch (err) {
        navigate('/admin/login');
      }
    };
    fetchAdminData();
  }, [navigate]);

  // Fetch dashboard stats (users/products) and recent lists
  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, productsRes] = await Promise.all([
          api.get('/admin/users?limit=5&count=true'),
          api.get('/admin/products/count?limit=5&count=true')
        ]);

        setRecentUsers(usersRes.data.users || []);
        setRecentProducts(productsRes.data.products || []);

        setCounts({
          users: usersRes.data.totalCount || usersRes.data.users?.length || 0,
          products: productsRes.data.totalCount || productsRes.data.products?.length || 0,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (admin) {
      fetchDashboard();
    }
  }, [admin]);

  const logout = async () => {
    try {
      await api.post('/admin/logout', {}, { headers: { 'X-CSRF-Token': csrf } });
      localStorage.removeItem('accessToken');
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading || !admin) {
    return <div className="text-center py-16">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        {error} - <button onClick={() => window.location.reload()} className="text-blue-500">
            <Link to={'/admin/login'}>
              Try again
            </Link>
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-4">
      {/* HEADER: Profile and logout */}
      <div className="flex items-center justify-between max-w-5xl mx-auto mb-6">
        <div>
          <h1 className="text-4xl font-bold text-indigo-800 mb-1">Admin Dashboard</h1>
          <p className="text-indigo-500">
            {admin.firstName} {admin.lastName} &middot; <span className="text-gray-500">{admin.role}</span>
          </p>
          {admin.email && <p className="text-gray-500">{admin.email}</p>}
          {admin.phone && <p className="text-gray-500">Phone: {admin.phone}</p>}
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white px-6" 
          onClick={logout}
        >
          Logout
        </Button>
      </div>

      {/* WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto px-4 sm:px-6 md:px-0">
        {/* Users widget */}
        <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold text-blue-600 mr-2">
              {counts.users.toLocaleString()}
            </span>
            <span className="text-gray-600">Users</span>
          </div>
          <ul className="mb-3">
            {recentUsers.map(u => (
              <li key={u._id} className="flex items-center justify-between border-b py-1 text-sm">
                <span className="truncate max-w-[120px] text-red-700">{u.firstName + u.lastName || 'Unknown User'}</span>
                <span className="text-gray-400">{u.email || 'No email'}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Link 
              to="/admin/users" 
              className="text-blue-600 hover:underline"
            >
              View All Users
            </Link>
            <Link 
              to="/admin/users/add" 
              className="text-blue-600 hover:underline"
            >
              Add User
            </Link>
          </div>
        </div>

        {/* Products widget */}
        <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold text-green-600 mr-2">
              {counts.products.toLocaleString()}
            </span>
            <span className="text-gray-600">Products</span>
          </div>
          <ul className="mb-3">
            {recentProducts.map(p => (
              <li
                key={p._id}
                className="flex items-center justify-between border-b py-2 text-sm sm:text-base"
              >
                <span className="truncate max-w-[60%] sm:max-w-[70%] text-ellipsis text-blue-700 overflow-hidden">
                  {p.name || 'Unnamed Product'}
                </span>

                {/* Product Price */}
                <span className="text-gray-500 text-right ml-2 min-w-[30%] sm:min-w-[20%]">
                  {p?.selling_Price?.price != null
                    ? `₹${p.selling_Price.price.toLocaleString()}`
                    : 'No price'}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Link 
              to="/admin/products" 
              className="text-green-600 hover:underline"
            >
              View All Products
            </Link>
            <Link 
              to="/admin/products" 
              className="text-green-600 hover:underline"
            >
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Quick action center */}
      <div className="max-w-2xl border-t border-blue-200 mt-12 mx-auto pt-6 flex justify-center gap-8">
        <Link to="/admin/users">
          <Button className="w-36 bg-blue-600 hover:bg-blue-700 text-white">
            ➕ Add User
          </Button>
        </Link>
        <Link to="/admin/products">
          <Button className="w-36 bg-green-600 hover:bg-green-700 text-white">
            ➕ Add Product
          </Button>
        </Link>
      </div>
      <div className="max-w-2xl border-t border-blue-200 mt-12 mx-auto pt-6 flex justify-center gap-8">
        <Link to="/admin/messages">
          <Button className="w-36 bg-blue-600 hover:bg-blue-700 text-white">
            See Messages
          </Button>
        </Link>
        <Link to="/admin/history">
          <Button className="w-36 bg-green-600 hover:bg-green-700 text-white">
            See Deleted user History
          </Button>
        </Link>
      </div>
    </div>
  );
}