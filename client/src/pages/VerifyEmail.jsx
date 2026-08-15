import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status === 'success' && (
          <>
            <h2>✅ Email Verified</h2>
            <p style={{ color: 'var(--text-muted)' }}>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>❌ Verification Failed</h2>
            <p style={{ color: 'var(--text-muted)' }}>{message}</p>
          </>
        )}
        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
