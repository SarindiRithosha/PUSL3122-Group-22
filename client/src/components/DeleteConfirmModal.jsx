import React from 'react';
import '../styles/DeleteConfirmModal.css';

const DeleteConfirmModal = ({ designName, onConfirm, onClose, isDeleting }) => (
  <div className="dcm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="dcm-modal">
      <div className="dcm-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
        </svg>
      </div>
      <h3 className="dcm-title">Delete Design?</h3>
      <p className="dcm-body">
        You're about to permanently delete <strong>"{designName}"</strong>.
        This action <strong>cannot be undone</strong>.
      </p>
      <div className="dcm-footer">
        <button className="dcm-btn-cancel" onClick={onClose} disabled={isDeleting}>
          Keep Design
        </button>
        <button className="dcm-btn-delete" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting
            ? <><span className="dcm-spinner" /> Deleting…</>
            : 'Yes, Delete Permanently'
          }
        </button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;