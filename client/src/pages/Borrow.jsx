import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import Table from '../components/Table';

const statusFilters = ['', 'pending', 'approved', 'issued', 'overdue', 'returned', 'rejected', 'cancelled'];

const Borrow = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/borrow', { params: { status: status || undefined, page, limit: 10 } });
      setBorrows(res.data.borrows);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load borrow records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const act = async (action, id, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await api.put(`/borrow/${action}/${id}`);
      toast.success('Action completed');
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const columns = [
    { key: 'book', label: 'Book', render: (r) => r.book?.title || 'N/A' },
    ...(isAdmin ? [{ key: 'student', label: 'Student', render: (r) => r.student?.name || 'N/A' }] : []),
    { key: 'status', label: 'Status', render: (r) => <span className={`badge badge-${r.status}`}>{r.status}</span> },
    { key: 'issueDate', label: 'Issued', render: (r) => (r.issueDate ? new Date(r.issueDate).toLocaleDateString() : '-') },
    { key: 'dueDate', label: 'Due Date', render: (r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-') },
    { key: 'returnDate', label: 'Returned', render: (r) => (r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '-') },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {isAdmin && r.status === 'pending' && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => act('approve', r._id)}>Approve</button>
              <button className="btn btn-danger btn-sm" onClick={() => act('reject', r._id)}>Reject</button>
            </>
          )}
          {isAdmin && (r.status === 'issued' || r.status === 'overdue') && (
            <button className="btn btn-primary btn-sm" onClick={() => act('return', r._id, 'Mark this book as returned?')}>
              Mark Returned
            </button>
          )}
          {!isAdmin && r.status === 'pending' && (
            <button className="btn btn-outline btn-sm" onClick={() => act('cancel', r._id, 'Cancel this request?')}>Cancel</button>
          )}
          {!isAdmin && r.status === 'issued' && r.renewCount < 2 && (
            <button className="btn btn-outline btn-sm" onClick={() => act('renew', r._id)}>Renew</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2>{isAdmin ? 'Borrow / Return Management' : 'My Borrows'}</h2>

      <div className="toolbar">
        {statusFilters.map((s) => (
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
          <Table columns={columns} data={borrows} page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default Borrow;
