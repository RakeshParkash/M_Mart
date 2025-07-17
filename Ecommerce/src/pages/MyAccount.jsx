import React, { useEffect, useState } from 'react';
import './MyAccount.css';
import { backendUrl } from '../utils/config.js';
import { useCookies } from 'react-cookie';
import { useNavigate, Link, useParams } from 'react-router-dom';

function Account() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookies, , removeCookie] = useCookies(['token']);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchUserData = async () => {
      setLoading(true);

      try {
        const token = cookies.token;
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Step 1: Get current user
        const meResponse = await fetch(`${backendUrl}/get/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: controller.signal,
        });

        if (!meResponse.ok) {
          throw new Error(meResponse.status === 401 ? 'Session expired' : 'Failed to fetch user data');
        }

        const meData = await meResponse.json();

        // Step 2: Get detailed user data
        const userResponse = await fetch(`${backendUrl}/get/user/${meData._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: controller.signal,
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch detailed user data');
        }

        const user = await userResponse.json();

        setUserData({
          _id: user._id,
          name: user.firstName + " " + user.lastName || 'Guest',
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
        console.error('Fetch error:', err);
        setError(err.message);
        if (err.message.toLowerCase().includes('authentication') || err.message.toLowerCase().includes('session')) {
          removeCookie('token', { path: '/' });
          navigate('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Abort on unmount
    return () => controller.abort();
  }, [cookies.token, navigate, removeCookie]);

  const handleLogout = () => {
    removeCookie('token', { path: '/' });
    navigate('/auth/login');
  };

  // UI States
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>
        <p className="error-message">{error}</p>
        <div className="action-buttons">
          <button onClick={() => window.location.reload()}>Retry</button>
          <button onClick={handleLogout}>Back to Login</button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="no-data-screen">
        <h2>No account data available</h2>
        <button onClick={handleLogout}>Please login again</button>
      </div>
    );
  }

  return (
    <div className="my-account">
      <h1>Welcome, {userData.name}</h1>
      
      <div className="account-sections">
        <section className="account-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{userData.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userData.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone:</span>
              <span className="info-value">{userData.phone}</span>
            </div>
            {userData.address && (
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{userData.address}</span>
              </div>
            )}
          </div>
          <button className="btn-edit">Edit Profile</button>
        </section>

        <section className="account-section">
          <h2>Your Bookings</h2>
          {userData.bookings.length > 0 ? (
            <ul className="booking-list">
              {userData.bookings.map((booking) => (
                <li key={booking.id} className="booking-card">
                  <h3>{booking.tourName}</h3>
                  <div className="booking-details">
                    <span>Date: {booking.date}</span>
                    <span className={`status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-bookings">
              <p>You haven't made any bookings yet.</p>
              <Link to="/tours" className="btn-explore">
                Explore Available Tours
              </Link>
            </div>
          )}
        </section>

        <section className="account-section actions">
          <h2>Account Management</h2>
          <button className="btn-change-password">Change Password</button>
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
}

export default Account;