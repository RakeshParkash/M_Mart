// src/pages/AdminSignup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/server';
import Input from '../components/shared/AdminInputs';
import Button from '../components/shared/AdminButton';

export default function AdminSignup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    masterKey: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        console.log(form);
      await api.post('/admin/register', form);
      alert('Admin account created! Please login.');
      navigate('/admin/login');
    } catch (err) {
      alert(err.response?.data?.err || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border border-blue-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Admin Sign Up
        </h2>
        <form onSubmit={submit} className="space-y-4 text-black">
            <Input label="First Name" name="firstName" required onChange={handleChange} />
            <Input label="Last Name" name="lastName" required onChange={handleChange} />
            <Input label="Email" name="email" required onChange={handleChange} />
            <Input label="Phone" name="phone" required onChange={handleChange} />
            <Input label="Master Key" name="masterKey" type="password" required onChange={handleChange} />
            <Input label="Password" name="password" type="password" required onChange={handleChange} />
            <Button disabled={loading} className="w-full">
                {loading ? 'Creating…' : 'Sign Up'}
            </Button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{' '}
          <Link className="text-blue-600 hover:underline" to="/admin/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
