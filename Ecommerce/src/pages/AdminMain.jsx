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

  const navigate = useNavigate();

  // Get CSRF and profile on mount
  useEffect(() => {
    api.get('/admin/csrf-token').then(res => setCSRF(res.data.csrfToken || ''));
    api.get('/admin/me').then(res => setAdmin(res.data.admin)).catch(() => navigate('/admin/login'));
  }, [navigate]);

  // Fetch dashboard stats (users/products) and recent lists
  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        // You must create these summary endpoints in backend for large db!
        const [users, products] = await Promise.all([
          api.get('/admin/users?limit=5'),
          api.get('/admin/products?limit=5')
        ]);
        setRecentUsers(users.data.users || []);
        setRecentProducts(products.data.products || []);

        setCounts({
          users: typeof users.data.total === 'number'
            ? users.data.total : users.data.users?.length || 0,
          products: typeof products.data.total === 'number'
            ? products.data.total : products.data.products?.length || 0,
        });
      } 
      catch (err) {
        // swallow error, already handled in profile
      }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const logout = async () => {
    await api.post('/admin/logout', {}, { headers: { 'X-CSRF-Token': csrf } });
    localStorage.removeItem('accessToken');
    navigate('/admin/login');
  };

  if (loading || !admin) return <div className="text-center py-16">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-4">
      {/* HEADER: Profile and logout */}
      <div className="flex items-center justify-between max-w-5xl mx-auto mb-6">
        <div>
          <h1 className="text-4xl font-bold text-indigo-800 mb-1">Admin Dashboard</h1>
          <p className="text-indigo-500">{admin.firstName} {admin.lastName} &middot; <span className="text-gray-500">{admin.role}</span></p>
          {admin.email && <p className="text-gray-500">{admin.email}</p>}
          <p className="text-gray-500">Phone: {admin.phone}</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6" onClick={logout}>Logout</Button>
      </div>

      {/* WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Users widget */}
        <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold text-blue-600 mr-2">{counts.users}</span>
            <span className="text-gray-600">Users</span>
          </div>
          <ul className="mb-3">
            {recentUsers?.map(u => (
              <li key={u._id} className="flex items-center justify-between border-b py-1 text-sm">
                <span>{u.name || u.email || u.phone}</span>
                <span className="text-gray-400">{u.email}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Link to="/admin/users" className="text-blue-600 hover:underline">View All Users</Link>
            <Link to="/admin/add-user" className="text-blue-600 hover:underline">Add User</Link>
          </div>
        </div>

        {/* Products widget */}
        <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col justify-between">
          <div className="flex items-center mb-2">
            <span className="text-2xl font-bold text-green-600 mr-2">{counts.products}</span>
            <span className="text-gray-600">Products</span>
          </div>
          <ul className="mb-3">
            {recentProducts?.map(p => (
              <li key={p._id} className="flex items-center justify-between border-b py-1 text-sm">
                <span>{p.name}</span>
                <span className="text-gray-400">{p.price && `₹${p.price}`}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Link to="/admin/products" className="text-green-600 hover:underline">View All Products</Link>
            <Link to="/admin/add-product" className="text-green-600 hover:underline">Add Product</Link>
          </div>
        </div>
      </div>

      {/* Quick action center: Add User/Product */}
      <div className="max-w-2xl border-t border-blue-200 mt-12 mx-auto pt-6 flex justify-center gap-8">
        <Link to="/admin/products">
          <Button className="w-36 bg-blue-600 hover:bg-blue-700 text-white">➕ Add User</Button>
        </Link>
        <Link to="/admin/add-product">
          <Button className="w-36 bg-green-600 hover:bg-green-700 text-white">➕ Add Product</Button>
        </Link>
      </div>
    </div>
  );
}
