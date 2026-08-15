import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ title, onClose, children, width }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={width ? { maxWidth: width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
