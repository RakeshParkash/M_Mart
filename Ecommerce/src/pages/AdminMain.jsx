// src/pages/AdminProfile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/server';
import Input from '../components/shared/AdminInputs';
import Button from '../components/shared/AdminButton';

export default function AdminMain() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' });
  const [productForm, setProductForm] = useState({ name: '', price: '', description: '' });
  const navigate = useNavigate();

  // Fetch admin profile info on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get('/admin/me');
        setAdminData(data.admin);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  // Handlers for forms
  const handleUserForm = (e) => setUserForm({ ...userForm, [e.target.name]: e.target.value });
  const handleProductForm = (e) => setProductForm({ ...productForm, [e.target.name]: e.target.value });

  const submitUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/add-user', userForm);
      alert('User added!');
      setUserForm({ name: '', email: '', phone: '' });
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to add user');
    }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/add-product', productForm);
      alert('Product added!');
      setProductForm({ name: '', price: '', description: '' });
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to add product');
    }
  };

  const logout = async () => {
    await api.post('/admin/logout');
    localStorage.removeItem('accessToken');
    navigate('/admin/login');
  };

  if (loading) return <div>Loading profile...</div>;
  if (!adminData) return <div>Unable to load account.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-lg bg-white rounded-xl p-8 shadow space-y-6 text-black">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <Button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4">Logout</Button>
        </div>
        <div>
          <p><b>Phone:</b> {adminData.phone}</p>
          {adminData.email && <p><b>Email:</b> {adminData.email}</p>}
          <p><b>Role:</b> {adminData.role}</p>
        </div>

        <hr />
        <h2 className="text-xl font-bold mb-2">Add New User</h2>
        <form onSubmit={submitUser} className="space-y-2">
          <Input label="Name" name="name" value={userForm.name} onChange={handleUserForm} required />
          <Input label="Email" name="email" value={userForm.email} onChange={handleUserForm} required />
          <Input label="Phone" name="phone" value={userForm.phone} onChange={handleUserForm} />
          <Button>Add User</Button>
        </form>

        <hr />
        <h2 className="text-xl font-bold mb-2">Add New Product</h2>
        <form onSubmit={submitProduct} className="space-y-2">
          <Input label="Name" name="name" value={productForm.name} onChange={handleProductForm} required />
          <Input label="Price" name="price" value={productForm.price} onChange={handleProductForm} required type="number" min="0" />
          <Input label="Description" name="description" value={productForm.description} onChange={handleProductForm} />
          <Button>Add Product</Button>
        </form>
      </div>
    </div>
  );
}
