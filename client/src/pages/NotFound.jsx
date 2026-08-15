import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
    <h1 style={{ fontSize: 72, margin: 0 }}>404</h1>
    <p style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
  </div>
);

export default NotFound;
