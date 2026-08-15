import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Table from '../components/Table';

const emptyStudent = { name: '', email: '', password: '', registrationNumber: '', department: '', phone: '', address: '' };

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyStudent);
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { search, page, limit: 10, role: 'student' } });
      setStudents(res.data.users);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyStudent);
    setShowModal(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({ ...emptyStudent, ...student, password: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/users', form);
        toast.success('Student added (default password: Library@123 if none set)');
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student "${student.name}"?`)) return;
    try {
      await api.delete(`/users/${student._id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'registrationNumber', label: 'Reg. No.' },
    { key: 'department', label: 'Department' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'isActive',
      label: 'Status',
      render: (r) => <span className={`badge badge-${r.isActive ? 'returned' : 'rejected'}`}>{r.isActive ? 'Active' : 'Inactive'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}><FiEdit2 /></button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}><FiTrash2 /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Students</h2>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><FiPlus /> Add Student</button>
      </div>

      <form onSubmit={handleSearch} className="toolbar">
        <input
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Search by name, email, reg. number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline btn-sm" type="submit"><FiSearch /> Search</button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <Table columns={columns} data={students} page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Student' : 'Add Student'} onClose={() => setShowModal(false)} width="560px">
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              {!editing && (
                <div className="form-group">
                  <label>Password (optional, default: Library@123)</label>
                  <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Registration Number</label>
                <input className="form-control" required value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
              {saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Students;
