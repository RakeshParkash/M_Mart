// src/pages/AdminLogin.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/server';
import Input from '../components/shared/AdminInputs';
import Button from '../components/shared/AdminButton';

export default function AdminLogin() {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      localStorage.setItem('accessToken', data.accessToken); // Fixed: use accessToken!!
      navigate('/admin/main');
    } catch (err) {
      alert(err.response?.data?.err || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow text-black">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form onSubmit={submit}>
          <Input label="Phone" name="phone" type="tel" required onChange={handleChange} />
          <Input label="Password" name="password" type="password" required onChange={handleChange} />
          <Button disabled={loading}>{loading ? 'Logging in…' : 'Login'}</Button>
        </form>
        <p className="text-center text-sm mt-4">
          No account?{' '}
          <Link className="text-indigo-600" to="/admin/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
