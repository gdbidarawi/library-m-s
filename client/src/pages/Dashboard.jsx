import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiBook, FiUsers, FiRepeat, FiCheckCircle, FiAlertTriangle, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const StatCard = ({ icon, color, value, label }) => (
  <div className="card stat-card">
    <div className="icon" style={{ background: color }}>
      {icon}
    </div>
    <div>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  </div>
);

const AdminDashboard = ({ data }) => {
  const { stats, charts, recentActivities } = data;

  const categoryChart = {
    labels: charts.booksByCategory.map((c) => c._id || 'Uncategorized'),
    datasets: [
      {
        data: charts.booksByCategory.map((c) => c.count),
        backgroundColor: ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777'],
      },
    ],
  };

  const borrowsChart = {
    labels: charts.borrowsLast7Days.map((d) => d._id),
    datasets: [
      {
        label: 'Borrow Requests',
        data: charts.borrowsLast7Days.map((d) => d.count),
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  };

  return (
    <>
      <div className="stat-cards-grid">
        <StatCard icon={<FiBook />} color="#2563eb" value={stats.totalBooks} label="Total Books" />
        <StatCard icon={<FiUsers />} color="#16a34a" value={stats.totalStudents} label="Total Students" />
        <StatCard icon={<FiRepeat />} color="#d97706" value={stats.borrowedBooks} label="Borrowed Books" />
        <StatCard icon={<FiCheckCircle />} color="#0891b2" value={stats.returnedBooks} label="Returned Books" />
        <StatCard icon={<FiAlertTriangle />} color="#dc2626" value={stats.overdueBooks} label="Overdue Books" />
        <StatCard
          icon={<FiDollarSign />}
          color="#7c3aed"
          value={`$${stats.fineCollected}`}
          label={`Fine Collected (Outstanding: $${stats.fineOutstanding})`}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Borrow Requests (Last 7 Days)</h3>
          <Bar data={borrowsChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Books by Category</h3>
          <Doughnut data={categoryChart} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent Activities</h3>
        {recentActivities.map((a) => (
          <div key={a._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
            <strong>{a.student?.name}</strong> requested <strong>{a.book?.title}</strong> —{' '}
            <span className={`badge badge-${a.status}`}>{a.status}</span>
          </div>
        ))}
        {recentActivities.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent activity</p>}
      </div>
    </>
  );
};

const StudentDashboard = ({ data }) => {
  const { stats, borrowedBooks } = data;
  return (
    <>
      <div className="stat-cards-grid">
        <StatCard icon={<FiBook />} color="#2563eb" value={stats.currentlyBorrowed} label="Currently Borrowed" />
        <StatCard icon={<FiAlertTriangle />} color="#dc2626" value={stats.overdueBooks} label="Overdue Books" />
        <StatCard icon={<FiCheckCircle />} color="#16a34a" value={stats.returnedBooks} label="Books Returned" />
        <StatCard icon={<FiDollarSign />} color="#7c3aed" value={`$${stats.unpaidFineAmount}`} label="Unpaid Fines" />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>My Borrowed Books</h3>
        {borrowedBooks.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You have no borrowed books right now.</p>}
        {borrowedBooks.map((b) => (
          <div key={b._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
            <strong>{b.book?.title}</strong> — Due: {new Date(b.dueDate).toDateString()}
          </div>
        ))}
      </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student';
    api
      .get(endpoint)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [user.role]);

  if (loading || !data) return <Loader />;

  return (
    <div>
      <h2>{user.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}</h2>
      {user.role === 'admin' ? <AdminDashboard data={data} /> : <StudentDashboard data={data} />}
    </div>
  );
};

export default Dashboard;
