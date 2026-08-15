import React, { useEffect, useState, useRef } from 'react';
import { FiBell, FiMoon, FiSun, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      // fail silently for notification polling
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('lms_theme', next ? 'dark' : 'light');
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="card"
      style={{
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
      }}
    >
      <button className="btn btn-outline btn-sm" onClick={onToggleSidebar} style={{ display: 'none' }}>
        <FiMenu />
      </button>
      <div style={{ fontWeight: 600 }}>Welcome, {user?.name}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
        <button className="btn btn-outline btn-sm" onClick={toggleDarkMode} title="Toggle dark mode">
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowNotif((s) => !s)}>
            <FiBell />
            {unreadCount > 0 && (
              <span
                style={{
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: 10,
                  padding: '1px 5px',
                  marginLeft: 4,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 40,
                width: 320,
                maxHeight: 380,
                overflowY: 'auto',
                zIndex: 100,
              }}
            >
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 14 }}>Notifications</strong>
                <button className="btn btn-outline btn-sm" onClick={markAllRead}>
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No notifications yet</div>
              )}
              {notifications.map((n) => (
                <div
                  key={n._id}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                    opacity: n.isRead ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
