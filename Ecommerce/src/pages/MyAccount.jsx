import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

// Register necessary Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

function ChangePasswordModal({ open, onClose, onSubmit, loading, error, success }) {
  // ... unchanged modal code ...
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
    <div className="fixed z-50 inset-0 bg-black/50 flex items-center justify-center px-2">
      <div className="relative bg-gradient-to-br from-[#fff8ee] to-[#f9f9f9] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-yellow-300 ring-1 ring-yellow-200 animate-fadeIn">
        <button className="absolute top-2 right-4 text-3xl text-[#d4af37] hover:text-[#222] transition" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold text-center text-[#d4af37] mb-5 tracking-wide">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-[#7f8c8d]">Old Password</span>
            <input type="password" required className="input block w-full rounded-lg border border-[#ccc] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-[#faf6ee]" value={oldPassword} onChange={e => setOldPassword(e.target.value)} autoFocus />
          </label>
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-[#7f8c8d]">New Password</span>
            <input type="password" required className="input block w-full rounded-lg border border-[#ccc] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-[#faf6ee]" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </label>
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-[#7f8c8d]">Repeat New Password</span>
            <input type="password" required className="input block w-full rounded-lg border border-[#ccc] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-[#faf6ee]" value={repeat} onChange={e => setRepeat(e.target.value)} />
          </label>
          {error && <div className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</div>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="w-full rounded-full py-2 font-semibold text-white bg-gradient-to-r from-[#d4af37] to-[#a67c52] shadow-lg transition hover:bg-gradient-to-tr hover:from-[#bfa544] hover:to-[#9f7d4c] disabled:opacity-70">
              {loading ? "Changing..." : "Change Password"}
            </button>
            <button type="button" onClick={onClose} className="w-full rounded-full py-2 font-semibold text-[#2c3e50] border border-[#d4af37] bg-[#faf6ee] shadow hover:bg-[#f2e8d8] transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PurchaseCard({ purchase }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#e8e1d1] bg-gradient-to-r from-[#fff8ee] to-[#fcfaf7] shadow-sm overflow-hidden mb-6 transition">
      {/* Header */}
      <button className="w-full text-left flex justify-between items-center px-6 py-4 hover:bg-yellow-50 transition group" onClick={() => setOpen(prev => !prev)} aria-expanded={open ? "true" : "false"}>
        <div className="flex items-center gap-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#a67c52] font-bold text-xs leading-relaxed">
            {new Date(purchase.date).toLocaleDateString()}
          </span>
          <span className="uppercase font-semibold text-[#424242] text-xs opacity-80 tracking-wider">
            {purchase.items.length} item{purchase.items.length !== 1 && "s"}
          </span>
        </div>
        <span className={`text-xl text-[#d4af37] transition duration-200 ${open ? "rotate-90" : ""}`}>▶</span>
      </button>
      <div className={`${open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"} transition-all duration-400 overflow-x-auto`}>
        <div className="p-0 md:p-6">
          <table className="w-full mt-2 rounded-md overflow-hidden bg-white shadow-sm text-lg">
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
                  <td className="py-2 px-3 text-right text-green-700 font-semibold">₹{item.advancePaid?.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-semibold">₹{item.totalPrice?.toLocaleString()}</td>
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
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [changeOpen, setChangeOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [cookies, , removeCookie] = useCookies(['token']);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    async function fetchUserData() {
      setLoading(true);
      try {
        const token = cookies.token;
        if (!token) throw new Error('No authentication token found');
        const meResponse = await fetch(`${import.meta.env.VITE_API}/me`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });
        if (!meResponse.ok) throw new Error(meResponse.status === 401 ? 'Session expired' : 'Failed to fetch user data');
        const meData = await meResponse.json();

        const userResponse = await fetch(`${import.meta.env.VITE_API}/get/user/${meData._id}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        });
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const user = await userResponse.json();

        const cartRes = await fetch(`${import.meta.env.VITE_API}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
          signal: controller.signal,
        });
        const cartData = cartRes.ok ? await cartRes.json() : { cart: [] };
        setCart(cartData.cart || []);

        const wishlistRes = await fetch(`${import.meta.env.VITE_API}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
          signal: controller.signal,
        });
        const wishlistData = wishlistRes.ok ? await wishlistRes.json() : { wishlist: [] };
        setWishlist(wishlistData.wishlist || []);

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
        body: JSON.stringify({ oldPassword, newPassword }),
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

  const handleLogout = () => {
    removeCookie('token', { path: '/' });
    navigate('/auth/login');
  };

  // --- Graph Data ---
  const purchaseGraphData = (() => {
    if (!userData?.purchased_history?.length) return null;
    // Group by month
    const byMonth = {};
    userData.purchased_history.forEach(ph => {
      const d = new Date(ph.date);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      byMonth[key] = (byMonth[key] || 0) + ph.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    });
    const months = Object.keys(byMonth).sort();
    return {
      labels: months.map(m => {
        // Format YYYY-M as MMM YYYY
        const parts = m.split('-');
        return new Date(parts[0], parts[1]-1).toLocaleString('default', { month: 'short', year: 'numeric' });
      }),
      datasets: [{
        label: 'Total Purchase (₹)',
        data: months.map(m => byMonth[m]),
        fill: false,
        borderColor: '#d4af37',
        backgroundColor: '#fff8ee',
        tension: 0.1,
      }]
    };
  })();

  // --- Render states
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-[#fff8ee] to-[#f9f9f9]">
        <Icon icon="mdi:loading" className="w-16 h-16 text-yellow-400 animate-spin mb-8" />
        <div className="text-lg text-[#bfa544] tracking-wide">Loading your dashboard...</div>
      </div>
    );
  }
  if (fetchError) {
    return (
      <div className="text-center p-8 max-w-xl mx-auto bg-white rounded-2xl shadow-lg mt-8 border border-yellow-200">
        <h2 className="text-2xl text-[#d4af37] font-light mb-4">Something went wrong</h2>
        <p className="text-red-600 bg-red-50 rounded-lg border-l-4 border-red-400 p-4 font-medium mb-6">{fetchError}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white shadow-lg transition hover:-translate-y-1">Retry</button>
          <button onClick={handleLogout} className="px-6 py-3 rounded-full font-semibold bg-white text-[#2c3e50] border border-gray-100 shadow hover:bg-gray-100">Back to Login</button>
        </div>
      </div>
    );
  }
  if (!userData) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-xl mx-auto mt-8 border border-yellow-200">
        <h2 className="text-2xl text-[#d4af37] font-light mb-4">No account data available</h2>
        <button onClick={handleLogout} className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white shadow-lg transition hover:-translate-y-1">Please login again</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen px-4 md:px-12 py-10 md:py-20 font-montserrat text-[#333] bg-gradient-to-br from-[#fff8ee] to-[#f9f9f9]">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-700 uppercase tracking-wide">My Dashboard</h1>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-[#d4af37] to-[#a67c52] text-white shadow-lg transition hover:-translate-y-1 hover:shadow-lg"
            onClick={() => setChangeOpen(true)}
          >
            <Icon icon="mdi:lock" className="inline-block mr-2" /> Change Password
          </button>
          <button className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white shadow-lg transition hover:-translate-y-1 hover:shadow-lg"
            onClick={handleLogout}
          >
            <Icon icon="mdi:logout" className="inline-block mr-2" /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow flex flex-col items-center py-8 px-4 border-b-4 border-yellow-200">
          <Icon icon="mdi:account-circle" className="text-5xl text-yellow-500 mb-2" />
          <div className="text-lg font-semibold text-yellow-700">Name</div>
          <div className="text-xl font-bold">{userData?.name}</div>
        </div>
        <Link to="/wishlist" className="bg-pink-50 rounded-xl shadow flex flex-col items-center py-8 px-4 border-b-4 border-pink-300 hover:shadow-lg hover:-translate-y-1 transition">
          <Icon icon="mdi:heart" className="text-5xl text-pink-500 mb-2" />
          <div className="text-lg font-semibold text-pink-700">Wishlist</div>
          <div className="text-xl font-bold">{wishlist.length}</div>
        </Link>
        <Link to="/cart" className="bg-green-50 rounded-xl shadow flex flex-col items-center py-8 px-4 border-b-4 border-green-300 hover:shadow-lg hover:-translate-y-1 transition">
          <Icon icon="mdi:cart" className="text-5xl text-green-500 mb-2" />
          <div className="text-lg font-semibold text-green-700">Cart</div>
          <div className="text-xl font-bold">{cart.length}</div>
        </Link>
        <div className="bg-yellow-50 rounded-xl shadow flex flex-col items-center py-8 px-4 border-b-4 border-yellow-300">
          <Icon icon="mdi:package-variant" className="text-5xl text-yellow-500 mb-2" />
          <div className="text-lg font-semibold text-yellow-700">Purchases</div>
          <div className="text-xl font-bold">{userData?.purchased_history?.length ?? 0}</div>
        </div>
      </div>

      {/* Purchase Graph */}
      {purchaseGraphData && (
        <div className="bg-white rounded-xl shadow p-8 mb-12 border border-yellow-100">
          <h2 className="text-xl font-bold text-yellow-700 mb-6">Purchases Over Time</h2>
          <Line data={purchaseGraphData} options={{
            responsive: true,
            plugins: { legend: { display: true, position: 'top' } },
            scales: { x: { grid: { color: '#f9e5b6' } }, y: { grid: { color: '#f9e5b6' } } }
          }} height={100} />
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white rounded-2xl shadow p-8 mb-12 border border-yellow-100 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-bold text-yellow-700 mb-6">Personal Info</h2>
          <div className="space-y-4 text-lg">
            <div>
              <span className="font-medium text-gray-500">Name:</span>
              <span className="ml-2 font-semibold">{userData?.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Email:</span>
              <span className="ml-2 font-semibold">{userData?.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Phone:</span>
              <span className="ml-2 font-semibold">{userData?.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Icon icon="mdi:account-cog" className="text-[7rem] text-yellow-200" />
        </div>
      </section>

      {/* Wishlist Quick Preview */}
      <section className="bg-pink-50 rounded-2xl shadow p-8 mb-12 border border-pink-100">
        <h2 className="text-xl font-bold text-pink-700 mb-6">Wishlist Preview</h2>
        {wishlist.length === 0 ? (
          <div className="text-gray-500">Your wishlist is empty. <Link className="text-pink-600 underline" to="/categories">Browse Products</Link></div>
        ) : (
          <ul className="divide-y divide-pink-100">
            {wishlist.slice(0, 4).map((item, idx) => (
              <li key={idx} className="py-3 flex items-center gap-4">
                <img src={item.product?.image || item.product?.img} alt={item.product?.name} className="w-12 h-12 object-contain rounded-xl border border-pink-200" />
                <span className="flex-1 font-semibold">{item.product?.name}</span>
                <Link to={`/product/${item.product?._id}`} className="text-pink-600 underline">View</Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-right">
          <Link to="/wishlist" className="text-pink-600 underline font-semibold">View Full Wishlist</Link>
        </div>
      </section>

      {/* Cart Quick Preview */}
      <section className="bg-green-50 rounded-2xl shadow p-8 mb-12 border border-green-100">
        <h2 className="text-xl font-bold text-green-700 mb-6">Cart Preview</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500">Your cart is empty. <Link className="text-green-600 underline" to="/categories">Go Shopping</Link></div>
        ) : (
          <ul className="divide-y divide-green-100">
            {cart.slice(0, 4).map((item, idx) => (
              <li key={idx} className="py-3 flex items-center gap-4">
                <img src={item.product?.image || item.product?.img} alt={item.product?.name} className="w-12 h-12 object-contain rounded-xl border border-green-200" />
                <span className="flex-1 font-semibold">{item.product?.name}</span>
                <span className="text-green-700 font-bold">x{item.quantity}</span>
                <span className="text-gray-600">
                  ₹{(item.product?.price || item.product?.selling_Price?.price || 0).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-right">
          <Link to="/cart" className="text-green-600 underline font-semibold">View Full Cart</Link>
        </div>
      </section>

      {/* Purchase History Section */}
      <section className="bg-yellow-50 rounded-2xl shadow p-8 mb-12 border border-yellow-100">
        <h2 className="text-xl font-bold text-yellow-700 mb-6">Purchase History</h2>
        {userData?.purchased_history?.length > 0 ? (
          <div>
            {userData.purchased_history.slice(0, 5).map((purchase, idx) => (
              <PurchaseCard purchase={purchase} key={purchase.date + idx} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 py-6">No purchases yet.</div>
        )}
      </section>

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