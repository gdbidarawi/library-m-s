import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import Table from '../components/Table';

const Fines = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [fines, setFines] = useState([]);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fines', { params: { status: status || undefined, page, limit: 10 } });
      setFines(res.data.fines);
      setPages(res.data.pages);
      setTotalUnpaid(res.data.totalUnpaidAmount);
    } catch (err) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const handlePay = async (fine) => {
    if (!window.confirm(`Mark fine of $${fine.amount} as paid?`)) return;
    try {
      await api.put(`/fines/pay/${fine._id}`);
      toast.success('Fine marked as paid');
      fetchFines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update fine');
    }
  };

  const columns = [
    { key: 'book', label: 'Book', render: (r) => r.borrow?.book?.title || 'N/A' },
    ...(isAdmin ? [{ key: 'student', label: 'Student', render: (r) => r.student?.name || 'N/A' }] : []),
    { key: 'daysLate', label: 'Days Late' },
    { key: 'amount', label: 'Amount', render: (r) => `$${r.amount}` },
    { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status}`}>{r.status}</span> },
    { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    ...(isAdmin
      ? [{
          key: 'actions',
          label: 'Actions',
          render: (r) => (r.status === 'unpaid' ? (
            <button className="btn btn-success btn-sm" onClick={() => handlePay(r)}>Mark Paid</button>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
          )),
        }]
      : []),
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Fine Management</h2>
        <div className="card" style={{ padding: '10px 20px' }}>
          <strong>Total Unpaid: ${totalUnpaid}</strong>
        </div>
      </div>

      <div className="toolbar">
        {['', 'unpaid', 'paid'].map((s) => (
          <button
            key={s || 'all'}
            className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <Table columns={columns} data={fines} page={page} pages={pages} onPageChange={setPage} emptyMessage="No fine records" />
        </div>
      )}
    </div>
  );
};

export default Fines;
