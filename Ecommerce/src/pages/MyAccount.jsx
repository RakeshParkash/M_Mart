import React, { useEffect, useState } from 'react';
import { backendUrl } from '../utils/config.js';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';

// Tailwind luxury modal overlay + card
function ChangePasswordModal({ open, onClose, onSubmit, loading, error, success }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeat, setRepeat] = useState('');

  useEffect(() => {
    if (open) {
      setOldPassword('');
      setNewPassword('');
      setRepeat('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(oldPassword, newPassword, repeat);
  };

  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 bg-black/40 flex items-center justify-center px-2">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md
        border border-[#d4af37]/20 ring-1 ring-[#d4af37]/20
        animate-fadeIn
      ">
        <button
          className="absolute top-2 right-4 text-3xl text-[#b09a63] hover:text-[#222] transition"
          onClick={onClose}
        >&times;</button>
        <h2 className="text-xl font-bold text-center text-[#2c3e50] mb-5 tracking-wide">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-[#7f8c8d]">Old Password</span>
            <input
              type="password"
              required
              className="input block w-full rounded-lg border border-[#ccc]
                px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-[#faf6ee]"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              autoFocus
            />
          </label>
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-[#7f8c8d]">New Password</span>
            <input
              type="password"
              required
              className="input block w-full rounded-lg border border-[#ccc]
                px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-[#faf6ee]"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-[#7f8c8d]">Repeat New Password</span>
            <input
              type="password"
              required
              className="input block w-full rounded-lg border border-[#ccc]
                px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-[#faf6ee]"
              value={repeat}
              onChange={e => setRepeat(e.target.value)}
            />
          </label>
          {error && <div className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="w-full rounded-full py-2 font-semibold text-white bg-gradient-to-r from-[#d4af37] to-[#a67c52] shadow-lg transition
              hover:bg-gradient-to-tr hover:from-[#bfa544] hover:to-[#9f7d4c]
              disabled:opacity-70">
              {loading ? "Changing..." : "Change Password"}
            </button>
            <button type="button" onClick={onClose}
              className="w-full rounded-full py-2 font-semibold text-[#2c3e50] border border-[#d4af37] bg-[#faf6ee] shadow
              hover:bg-[#f2e8d8] transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Status badge utility
function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border border-green-200",
    cancelled: "bg-red-100 text-red-500 border border-red-200"
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${map[status.toLowerCase()] || 'bg-gray-200 text-gray-700'}`}>
      {status}
    </span>
  );
}

function Account() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies, , removeCookie] = useCookies(['token']);
  const navigate = useNavigate();

  // Modal state
  const [changeOpen, setChangeOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = cookies.token;
        if (!token) throw new Error('No authentication token found');
        // Step 1: Get current user
        const meResponse = await fetch(`${backendUrl}/me`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });
        if (!meResponse.ok) throw new Error(meResponse.status === 401 ? 'Session expired' : 'Failed to fetch user data');
        const meData = await meResponse.json();
        // Step 2: Get detailed user data
        const userResponse = await fetch(`${backendUrl}/get/user/${meData._id}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });
        if (!userResponse.ok) throw new Error('Failed to fetch detailed user data');
        const user = await userResponse.json();
        setUserData({
          _id: user._id,
          name: (user.firstName + " " + user.lastName).trim() || 'Guest',
          email: user.email || 'No email provided',
          phone: user.phone || 'Not provided',
          bookings: Array.isArray(user.bookings)
            ? user.bookings.map((booking) => ({
                id: booking._id,
                tourName: booking.tourName,
                date: booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A',
                status: booking.status || 'Pending',
              }))
            : [],
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        if (
          err.message.toLowerCase().includes('authentication') ||
          err.message.toLowerCase().includes('session')
        ) {
          removeCookie('token', { path: '/' });
          navigate('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    return () => controller.abort();
  }, [cookies.token, navigate, removeCookie]);

  const handleLogout = () => {
    removeCookie('token', { path: '/' });
    navigate('/auth/login');
  };

  // Password change logic
  const handlePassword = async (oldPassword, newPassword, repeat) => {
    setPwError('');
    setPwSuccess('');

    // Basic frontend validation
    if (!oldPassword || !newPassword || !repeat) {
      setPwError("Please fill all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== repeat) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const token = cookies.token;
      const response = await fetch(`${backendUrl}/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPwError(data?.message || "Failed to change password.");
      } else {
        setPwSuccess("Password changed successfully.");
        setTimeout(() => {
          setChangeOpen(false); setPwError(''); setPwSuccess('');
        }, 1800);
      }
    } catch (err) {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  // Render states
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-[#d4af37]/10 border-t-[#d4af37] rounded-full animate-spin mb-8 shadow-[0_0_20px_#d4af37/30]" />
        <div className="text-lg text-[#7f8c8d] tracking-wide">Loading your account...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center p-8 max-w-xl mx-auto bg-white rounded-2xl shadow-lg mt-8">
        <h2 className="text-2xl text-[#2c3e50] font-light mb-4">Something went wrong</h2>
        <p className="text-red-600 bg-red-50 rounded-lg border-l-4 border-red-400 p-4 font-medium mb-6">
          {error}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white shadow-lg transition hover:-translate-y-1"
          >Retry</button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-full font-semibold bg-white text-[#2c3e50] border border-gray-100 shadow hover:bg-gray-100"
          >Back to Login</button>
        </div>
      </div>
    );
  }
  if (!userData) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-xl mx-auto mt-8">
        <h2 className="text-2xl text-[#2c3e50] font-light mb-4">No account data available</h2>
        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white shadow-lg transition hover:-translate-y-1"
        >Please login again</button>
      </div>
    );
  }

  return (
    <div className="
      max-w-[1400px] mx-auto min-h-screen
      px-4 md:px-16 py-12 md:py-24
      font-montserrat text-[#333]
      bg-gradient-to-br from-[#f9f9f9] to-[#fff]
    ">
      <h1 className="
          text-[2.3rem] md:text-[3em] font-light
          text-center text-[#2c3e50] mb-12 uppercase tracking-wide relative
          after:block after:mx-auto after:mt-6
          after:w-[150px] after:h-[2px] after:bg-gradient-to-r 
          after:from-transparent after:via-[#d4af37] after:to-transparent
        ">
        Welcome, {userData.name}
      </h1>

      <div className="
        grid gap-12 py-8
        grid-cols-1 lg:grid-cols-[1fr_2fr]
      ">
        {/* Personal Info */}
        <section className="
            bg-white/90 rounded-2xl p-8 md:p-12
            border border-white/80
            shadow-[0_15px_30px_rgba(0,0,0,0.05)]
            backdrop-blur-lg
            relative overflow-hidden
            transition-all duration-500
            before:content-[''] before:absolute before:top-0 before:left-0
            before:w-full before:h-[5px]
            before:bg-gradient-to-r before:from-[#d4af37]
            before:via-[#a67c52]
            before:to-[#d4af37]
            hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.10)]
        ">
          <h2 className="text-2xl font-normal text-[#2c3e50] mb-8 pb-4
              border-b border-black/10 tracking-wide relative
              after:content-[''] after:absolute after:bottom-[-1px] after:left-0
              after:w-[50px] after:h-[2px] after:bg-[#d4af37]"
          >Personal Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center py-5 border-b border-black/5">
              <span className="font-medium text-[#7f8c8d] text-base tracking-wide">Name:</span>
              <span className="text-right font-medium text-lg text-[#2c3e50]">{userData.name}</span>
            </div>
            <div className="flex justify-between items-center py-5 border-b border-black/5">
              <span className="font-medium text-[#7f8c8d] text-base tracking-wide">Email:</span>
              <span className="text-right font-medium text-lg text-[#2c3e50]">{userData.email}</span>
            </div>
            <div className="flex justify-between items-center py-5 border-b border-black/5">
              <span className="font-medium text-[#7f8c8d] text-base tracking-wide">Phone:</span>
              <span className="text-right font-medium text-lg text-[#2c3e50]">{userData.phone}</span>
            </div>
          </div>
          <button className="
            inline-block w-full px-8 py-4 rounded-full font-bold mt-6
            bg-gradient-to-r from-[#d4af37] to-[#a67c52] text-white
            shadow-[0_5px_15px_rgba(212,175,55,0.3)]
            relative overflow-hidden z-10
            transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]
            before:content-[''] before:absolute before:top-0 before:left-0
            before:w-full before:h-full before:bg-white/10 before:-translate-x-full
            hover:before:translate-x-0 before:transition-transform before:duration-300
          ">
            Edit Profile
          </button>
        </section>

        {/* Bookings */}
        <section className="bg-white/90 rounded-2xl p-8 md:p-12 border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.05)] backdrop-blur-lg relative overflow-hidden">
          <h2 className="text-2xl font-normal text-[#2c3e50] mb-8 pb-4 border-b border-black/10 tracking-wide relative after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-[50px] after:h-[2px] after:bg-[#d4af37]">
            Your Bookings
          </h2>
          {userData.bookings.length > 0 ? (
            <ul className="grid gap-6 p-0 m-0 list-none">
              {userData.bookings.map((booking) => (
                <li key={booking.id}
                  className="bg-white rounded-xl p-6 shadow-[0_5px_15px_rgba(0,0,0,0.03)] border border-black/5 relative overflow-hidden transition-all duration-400
                  before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-[#d4af37] before:to-[#a67c52]
                  hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                >
                  <h3 className="mb-3 font-medium text-[#2c3e50] text-lg">{booking.tourName}</h3>
                  <div className="flex justify-between items-center text-sm text-[#7f8c8d]">
                    <span>Date: {booking.date}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="
              text-center px-8 py-12 bg-[#f8f9fa]/50 
              rounded-xl border border-dashed border-black/10
            ">
              <p className="text-[#7f8c8d] mb-6 text-lg">
                You haven't made any bookings yet.
              </p>
              <Link to="/tours"
                className="inline-block px-6 py-3 rounded-full font-bold bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white shadow-[0_5px_15px_rgba(46,204,113,0.3)] hover:-translate-y-1"
              >Explore Available Tours</Link>
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="
            bg-white/90 rounded-2xl p-8 md:p-12
            border border-white/80
            shadow-[0_15px_30px_rgba(0,0,0,0.05)]
            backdrop-blur-lg
            relative overflow-hidden">
          <h2 className="text-2xl font-normal text-[#2c3e50] mb-8 pb-4 border-b border-black/10 tracking-wide relative after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-[50px] after:h-[2px] after:bg-[#d4af37]">
            Account Management
          </h2>
          <button
            className="w-full rounded-full py-3 font-bold bg-gradient-to-r from-[#7f8c8d] to-[#95a5a6] text-white mb-4 shadow transition hover:-translate-y-1 hover:shadow-lg"
            onClick={() => setChangeOpen(true)}
          >Change Password</button>
          <button
            className="w-full rounded-full py-3 font-bold bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white shadow transition hover:-translate-y-1 hover:shadow-lg"
            onClick={handleLogout}
          >Sign Out</button>
        </section>
      </div>

      {/* Modal */}
      <ChangePasswordModal
        open={changeOpen}
        onClose={() => { setChangeOpen(false); setPwError(''); setPwSuccess(''); }}
        onSubmit={handlePassword}
        loading={pwLoading}
        error={pwError}
        success={pwSuccess}
      />
    </div>
  );
}

export default Account;
