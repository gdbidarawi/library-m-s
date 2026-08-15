import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiUsers,
  FiRepeat,
  FiDollarSign,
  FiBarChart2,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    borderRadius: 8,
    color: isActive ? '#fff' : 'var(--sidebar-text)',
    background: isActive ? 'var(--primary)' : 'transparent',
    fontSize: 14,
    marginBottom: 4,
  });

  return (
    <aside
      className="sidebar"
      style={{
        width: 240,
        background: 'var(--sidebar-bg)',
        padding: '20px 12px',
        flexShrink: 0,
      }}
    >
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, padding: '0 12px 20px' }}>
        📚 LibrarySys
      </div>

      <NavLink to="/dashboard" style={linkStyle}>
        <FiHome /> Dashboard
      </NavLink>
      <NavLink to="/books" style={linkStyle}>
        <FiBook /> Books
      </NavLink>
      {isAdmin && (
        <NavLink to="/students" style={linkStyle}>
          <FiUsers /> Students
        </NavLink>
      )}
      <NavLink to="/borrow" style={linkStyle}>
        <FiRepeat /> {isAdmin ? 'Borrow / Return' : 'My Borrows'}
      </NavLink>
      <NavLink to="/fines" style={linkStyle}>
        <FiDollarSign /> Fines
      </NavLink>
      {isAdmin && (
        <NavLink to="/reports" style={linkStyle}>
          <FiBarChart2 /> Reports
        </NavLink>
      )}
      <NavLink to="/profile" style={linkStyle}>
        <FiUser /> Profile
      </NavLink>
      <NavLink to="/settings" style={linkStyle}>
        <FiSettings /> Settings
      </NavLink>
    </aside>
  );
};

export default Sidebar;
