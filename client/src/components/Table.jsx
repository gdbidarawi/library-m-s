import React from 'react';

/**
 * Generic table component.
 * columns: [{ key, label, render? }]
 * data: array of row objects
 */
const Table = ({ columns, data, page, pages, onPageChange, emptyMessage = 'No records found' }) => {
  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row._id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pages > 1 && (
        <div className="flex-between" style={{ marginTop: 16 }}>
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Page {page} of {pages}
          </span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
