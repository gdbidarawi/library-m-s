import React from 'react';
import { FiBookOpen } from 'react-icons/fi';

const BookCard = ({ book, actionLabel, onAction, disabled }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          height: 140,
          background: 'var(--bg)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {book.image ? (
          <img src={book.image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <FiBookOpen size={40} color="var(--text-muted)" />
        )}
      </div>
      <div>
        <strong style={{ fontSize: 15 }}>{book.title}</strong>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{book.author}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {book.category} • {book.available}/{book.quantity} available
        </div>
      </div>
      {actionLabel && (
        <button
          className="btn btn-primary btn-sm"
          disabled={disabled || book.available < 1}
          onClick={() => onAction(book)}
        >
          {book.available < 1 ? 'Unavailable' : actionLabel}
        </button>
      )}
    </div>
  );
};

export default BookCard;
