
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

        setRecentUsers((usersRes.data.users || []).slice(0, 5));
        setRecentProducts((productsRes.data.products || []).slice(0, 5));

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 py-10 px-2">
      {/* HEADER: Profile and logout */}
      <div className="flex items-center justify-between max-w-5xl mx-auto mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-800 mb-1">Admin Dashboard</h1>
          <p className="text-indigo-500 font-medium flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">{admin.firstName} {admin.lastName}</span>
            <span className="text-gray-500">· {admin.role}</span>
          </p>
          {admin.email && <p className="text-gray-600 font-mono">{admin.email}</p>}
          {admin.phone && <p className="text-gray-500">Phone: {admin.phone}</p>}
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-lg"
          onClick={logout}
        >
          Logout
        </Button>
      </div>

      {/* DASHBOARD WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {/* Users widget */}
        <div className="rounded-2xl bg-white shadow-2xl p-6 flex flex-col justify-between border-l-4 border-blue-400 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-3">
              <svg width="24" height="24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#2563eb"/></svg>
            </span>
            <span className="text-3xl font-bold text-blue-600 mr-2">{counts.users.toLocaleString()}</span>
            <span className="text-gray-700 font-semibold">Users</span>
          </div>
          <ul className="mb-4 space-y-2">
            {recentUsers.map(u => (
              <li key={u._id} className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="10" fill="#fda4af"/><text x="50%" y="55%" textAnchor="middle" fontSize="10" fill="#fff">{u.firstName[0] || "U"}</text></svg>
                  <span className="truncate max-w-[120px] text-blue-800 font-medium">{u.firstName + " " + u.lastName || 'Unknown User'}</span>
                </span>
                <span className="text-gray-400 font-mono text-xs" title={u.email}>{u.email || 'No email'}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 mt-2">
            <Link to="/admin/users" className="text-blue-600 hover:underline font-semibold">
              View All Users
            </Link>
            <Link to="/admin/users" className="text-blue-600 hover:underline font-semibold">
              Add User
            </Link>
          </div>
        </div>

        {/* Products widget */}
        <div className="rounded-2xl bg-white shadow-2xl p-6 flex flex-col justify-between border-l-4 border-green-400 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mr-3">
              <svg width="24" height="24" fill="none"><path d="M3 7V6a4 4 0 014-4h10a4 4 0 014 4v1M3 7h18M3 7v9a4 4 0 004 4h6a4 4 0 004-4V7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="text-3xl font-bold text-green-600 mr-2">{counts.products.toLocaleString()}</span>
            <span className="text-gray-700 font-semibold">Products</span>
          </div>
          <ul className="mb-4 space-y-2">
            {recentProducts.map(p => (
              <li
                key={p._id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="truncate max-w-[70%] text-green-700 font-medium" title={p.name}>{p.name || 'Unnamed Product'}</span>
                <span className="text-gray-500 ml-2 min-w-[30%] text-right font-mono" title="Product Price">
                  {p?.selling_Price?.price != null
                    ? `₹${p.selling_Price.price.toLocaleString()}`
                    : 'No price'}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 mt-2">
            <Link to="/admin/products" className="text-green-600 hover:underline font-semibold">
              View All Products
            </Link>
            <Link to="/admin/products" className="text-green-600 hover:underline font-semibold">
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Quick action center */}
      <div className="max-w-2xl border-t border-blue-200 mt-14 mx-auto pt-8 flex flex-wrap justify-center gap-6">
        <Link to="/admin/users">
          <Button className="w-40 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            ➕ Add User
          </Button>
        </Link>
        <Link to="/admin/products">
          <Button className="w-40 bg-green-600 hover:bg-green-700 text-white shadow-md">
            ➕ Add Product
          </Button>
        </Link>
        <Link to="/admin/messages">
          <Button className="w-40 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            See Messages
          </Button>
        </Link>
        <Link to="/admin/history">
          <Button className="w-40 bg-rose-600 hover:bg-rose-700 text-white shadow-md">
            Deleted User History
          </Button>
        </Link>
      </div>
    </div>
  );
}