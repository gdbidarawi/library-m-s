import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiDownload } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/Loader';

const periods = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'annual', label: 'Annual' },
];

const Reports = () => {
  const [period, setPeriod] = useState('monthly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async (p) => {
    setPeriod(p);
    setLoading(true);
    try {
      const res = await api.get(`/reports/${p}`);
      setReport(res.data);
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    generateReport('monthly');
  }, []);

  return (
    <div>
      <h2>Reports</h2>

      <div className="toolbar">
        {periods.map((p) => (
          <button
            key={p.key}
            className={`btn btn-sm ${period === p.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => generateReport(p.key)}
          >
            {p.label}
          </button>
        ))}
        <a href={`${api.defaults.baseURL}/reports/${period}/export/pdf`} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
          <FiDownload /> Export PDF
        </a>
        <a href={`${api.defaults.baseURL}/reports/${period}/export/excel`} className="btn btn-outline btn-sm">
          <FiDownload /> Export Excel
        </a>
      </div>

      {loading || !report ? (
        <Loader />
      ) : (
        <>
          <div className="stat-cards-grid">
            <div className="card">
              <div className="value">{report.summary.totalBorrowRequests}</div>
              <div className="label">Total Borrow Requests</div>
            </div>
            <div className="card">
              <div className="value">{report.summary.issued}</div>
              <div className="label">Books Issued</div>
            </div>
            <div className="card">
              <div className="value">{report.summary.returned}</div>
              <div className="label">Books Returned</div>
            </div>
            <div className="card">
              <div className="value">{report.summary.pending}</div>
              <div className="label">Pending Requests</div>
            </div>
            <div className="card">
              <div className="value">${report.summary.totalFines}</div>
              <div className="label">Total Fines Issued</div>
            </div>
            <div className="card">
              <div className="value">${report.summary.paidFines}</div>
              <div className="label">Fines Paid</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Borrow Records — {period.toUpperCase()}</h3>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {report.borrows.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No records for this period</td></tr>
                  )}
                  {report.borrows.map((b) => (
                    <tr key={b._id}>
                      <td>{b.book?.title}</td>
                      <td>{b.student?.name}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
