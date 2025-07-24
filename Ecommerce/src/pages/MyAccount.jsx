import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';

// Tailwind modal for password change (unchanged)
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

// PURCHASE HISTORY CARD (Collapse per date)
function PurchaseCard({ purchase }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#e8e1d1] bg-[#fcfaf7] shadow-sm overflow-hidden mb-6 transition">
      {/* Header */}
      <button
        className="w-full text-left flex justify-between items-center px-6 py-4 hover:bg-[#fffbe6] transition group"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open ? "true" : "false"}
      >
        <div className="flex items-center gap-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#a67c52] font-bold text-xs leading-relaxed">
            {new Date(purchase.date).toLocaleDateString()}
          </span>
          <span className="uppercase font-semibold text-[#424242] text-xs opacity-80 tracking-wider">
            {purchase.items.length} item{purchase.items.length !== 1 && "s"}
          </span>
        </div>
        <span className={`text-xl text-[#d4af37] transition duration-200 ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>
      <div className={`${open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-400 overflow-hidden`}>
        <div className="p-0 md:p-6">
          <table className="w-full mt-2 rounded-md overflow-hidden bg-white shadow-sm">
            <thead>
              <tr className="bg-[#fdf6ea] text-[#a67c52] font-bold text-sm">
                <th className="py-2 px-3 text-left">Item</th>
                <th className="py-2 px-3 text-center">Quantity</th>
                <th className="py-2 px-3 text-right">Advance Paid</th>
                <th className="py-2 px-3 text-right">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, idx) => (
                <tr key={item.name + idx} className="odd:bg-[#f9f6ef]/50 even:bg-white border-b last:border-0">
                  <td className="py-2 px-3 font-semibold text-[#273042]">{item.name}</td>
                  <td className="py-2 px-3 text-center">{item.quantity}</td>
                  <td className="py-2 px-3 text-right text-green-700 font-semibold">
                    ₹{item.advancePaid?.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold">
                    ₹{item.totalPrice?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Account() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal state
  const [changeOpen, setChangeOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const [cookies, , removeCookie] = useCookies(['token']);
  const navigate = useNavigate();

  // Fetch user on mount
  useEffect(() => {
    const controller = new AbortController();
    async function fetchUserData() {
      setLoading(true);
      try {
        const token = cookies.token;
        if (!token) throw new Error('No authentication token found');
        // Get current user's ID
        const meResponse = await fetch(`${import.meta.env.VITE_API}/me`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });
        if (!meResponse.ok) throw new Error(meResponse.status === 401 ? 'Session expired' : 'Failed to fetch user data');
        const meData = await meResponse.json();

        // Get detailed user (with purchase history)
        const userResponse = await fetch(`${import.meta.env.VITE_API}/get/user/${meData._id}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const user = await userResponse.json();
        setUserData({
          _id: user._id,
          name: ((user.firstName || "") + " " + (user.lastName || "")).trim() || 'Guest',
          email: user.email || 'No email provided',
          phone: user.phone || 'Not provided',
          purchased_history: Array.isArray(user.purchased_history)
            ? user.purchased_history
                .map(p => ({
                  date: p.date,
                  items: Array.isArray(p.items)
                    ? p.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        advancePaid: item.advancePaid,
                        totalPrice: item.totalPrice,
                      }))
                    : [],
                }))
                // Sort latest date first
                .sort((a, b) => new Date(b.date) - new Date(a.date))
            : [],
        });

      } catch (err) {
        if (err.name === 'AbortError') return;
        setFetchError(err.message);
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
    }
    fetchUserData();
    return () => controller.abort();
  }, [cookies.token, navigate, removeCookie]);

  // Password change logic
  const handlePassword = async (oldPassword, newPassword, repeat) => {
    setPwError('');
    setPwSuccess('');
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
      const response = await fetch(`${import.meta.env.VITE_API}/change-password`, {
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

  // Logout
  const handleLogout = () => {
    removeCookie('token', { path: '/' });
    navigate('/auth/login');
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
  if (fetchError) {
    return (
      <div className="text-center p-8 max-w-xl mx-auto bg-white rounded-2xl shadow-lg mt-8">
        <h2 className="text-2xl text-[#2c3e50] font-light mb-4">Something went wrong</h2>
        <p className="text-red-600 bg-red-50 rounded-lg border-l-4 border-red-400 p-4 font-medium mb-6">
          {fetchError}
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
    <div className="max-w-[1400px] mx-auto min-h-screen px-4 md:px-16 py-12 md:py-24 font-montserrat text-[#333] bg-gradient-to-br from-[#f9f9f9] to-[#fff]">
      <h1 className="
        text-[2.3rem] md:text-[3em] font-light
        text-center text-[#2c3e50] mb-12 uppercase tracking-wide relative
        after:block after:mx-auto after:mt-6
        after:w-[150px] after:h-[2px] after:bg-gradient-to-r 
        after:from-transparent after:via-[#d4af37] after:to-transparent
      ">
        Welcome, {userData.name}
      </h1>

      <div className="grid gap-12 py-8 grid-cols-1 lg:grid-cols-[1fr_2fr]">
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
          >Personal Info</h2>
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
          <button
            className="
              inline-block w-full px-8 py-4 rounded-full font-bold mt-6
              bg-gradient-to-r from-[#d4af37] to-[#a67c52] text-white
              shadow-[0_5px_15px_rgba(212,175,55,0.3)]
              relative overflow-hidden z-10
              transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]
              before:content-[''] before:absolute before:top-0 before:left-0
              before:w-full before:h-full before:bg-white/10 before:-translate-x-full
              hover:before:translate-x-0 before:transition-transform before:duration-300
            "
            // onClick={handleProfileEdit}
          >
            Edit Profile
          </button>
        </section>

        {/* Purchase History */}
        <section className="bg-white/90 rounded-2xl p-8 md:p-12 border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.05)] backdrop-blur-lg relative overflow-hidden">
          <h2 className="text-2xl font-normal text-[#2c3e50] mb-8 pb-4 border-b border-black/10 tracking-wide relative after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-[50px] after:h-[2px] after:bg-[#d4af37]">
            Your Purchases
          </h2>
          {userData.purchased_history && userData.purchased_history.length > 0 ? (
            <div>
              {userData.purchased_history.map((purchase, idx) => (
                <PurchaseCard purchase={purchase} key={purchase.date + idx} />
              ))}
            </div>
          ) : (
            <div className="
              text-center px-8 py-12 bg-[#f8f9fa]/50 
              rounded-xl border border-dashed border-black/10
            ">
              <p className="text-[#7f8c8d] mb-6 text-lg">
                No purchases yet.
              </p>
              <Link to="/shop"
                className="inline-block px-6 py-3 rounded-full font-bold bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white shadow-[0_5px_15px_rgba(46,204,113,0.3)] hover:-translate-y-1"
              >Go Shopping</Link>
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

      {/* Password Modal */}
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
