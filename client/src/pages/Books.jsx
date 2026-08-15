import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiUpload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Table from '../components/Table';
import BookCard from '../components/BookCard';

const emptyBook = {
  title: '', isbn: '', author: '', publisher: '', category: '', edition: '',
  language: 'English', shelfNumber: '', quantity: 1,
};

const Books = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', { params: { search, page, limit: isAdmin ? 10 : 12 } });
      setBooks(res.data.books);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyBook);
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title, isbn: book.isbn, author: book.author, publisher: book.publisher,
      category: book.category, edition: book.edition, language: book.language,
      shelfNumber: book.shelfNumber, quantity: book.quantity,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);

      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Book updated');
      } else {
        await api.post('/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Book added');
      }
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${book._id}`);
      toast.success('Book deleted');
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleRequestBorrow = async (book) => {
    try {
      await api.post('/borrow', { bookId: book._id });
      toast.success('Borrow request submitted');
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request book');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('csvFile', file);
    try {
      const res = await api.post('/books/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      fetchBooks();
    } catch (err) {
      toast.error('Import failed');
    }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'category', label: 'Category' },
    { key: 'available', label: 'Available', render: (r) => `${r.available}/${r.quantity}` },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={() => openEditModal(r)}><FiEdit2 /></button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}><FiTrash2 /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Books</h2>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={`${api.defaults.baseURL}/books/export/csv`} className="btn btn-outline btn-sm"><FiDownload /> CSV</a>
            <a href={`${api.defaults.baseURL}/books/export/pdf`} className="btn btn-outline btn-sm"><FiDownload /> PDF</a>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <FiUpload /> Import CSV
              <input type="file" accept=".csv" hidden onChange={handleImport} />
            </label>
            <button className="btn btn-primary btn-sm" onClick={openAddModal}><FiPlus /> Add Book</button>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="toolbar">
        <input
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="Search by title, author, ISBN, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline btn-sm" type="submit"><FiSearch /> Search</button>
      </form>

      {loading ? (
        <Loader />
      ) : isAdmin ? (
        <div className="card">
          <Table columns={columns} data={books} page={page} pages={pages} onPageChange={setPage} />
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {books.map((b) => (
              <BookCard key={b._id} book={b} actionLabel="Request" onAction={handleRequestBorrow} />
            ))}
          </div>
          {pages > 1 && (
            <div className="flex-between" style={{ marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal title={editingBook ? 'Edit Book' : 'Add Book'} onClose={() => setShowModal(false)} width="600px">
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input className="form-control" required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input className="form-control" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input className="form-control" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input className="form-control" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Edition</label>
                <input className="form-control" value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Language</label>
                <input className="form-control" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Shelf Number</label>
                <input className="form-control" value={form.shelfNumber} onChange={(e) => setForm({ ...form, shelfNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min={1} className="form-control" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Book Image</label>
                <input type="file" accept="image/*" className="form-control" onChange={(e) => setImageFile(e.target.files[0])} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
              {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Books;
