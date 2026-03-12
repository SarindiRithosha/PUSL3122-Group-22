import React, { useState } from 'react';
import '../styles/SaveDesignModal.css';

const DESIGN_STYLES = [
  '', 'Scandinavian', 'Minimalist', 'Traditional', 'Modern', 'Industrial',
  'Bohemian', 'Contemporary', 'Coastal', 'Rustic', 'Art Deco', 'Other',
];

const ROOM_TYPES = [
  '', 'Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Office',
  'Bathroom', 'Kids Room', 'Hallway', 'Balcony', 'Studio', 'Other',
];

const SaveDesignModal = ({ designName, designStyle: initialStyle, roomType: initialRoomType, room, placedItems, onConfirm, onClose, isSaving }) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const roomLabel = room?.name || room?.shape || 'Custom Room';
  const itemCount = placedItems?.length || 0;

  const [form, setForm] = useState({
    name:        designName    || 'Untitled Design',
    clientName:  '',
    date:        today,
    status:      'Draft',
    isFinalized: false,
    designStyle: initialStyle    || '',
    roomType:    initialRoomType || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="sdm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sdm-modal">

        {/* Header */}
        <div className="sdm-header">
          <div className="sdm-header-left">
            <div className="sdm-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DE8B47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </div>
            <div>
              <h2 className="sdm-title">Save to Design Library</h2>
              <p className="sdm-subtitle">Review and confirm before saving</p>
            </div>
          </div>
          <button className="sdm-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Info chips */}
        <div className="sdm-chips">
          <div className="sdm-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>{roomLabel}</span>
          </div>
          <div className="sdm-chip sdm-chip-items">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <strong>{itemCount}</strong>&nbsp;furniture item{itemCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Form */}
        <div className="sdm-form">

          {/* Design Name */}
          <div className="sdm-field">
            <label className="sdm-label">Design Name <span className="sdm-req">*</span></label>
            <input className="sdm-input" type="text" value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="e.g. Modern Living Room"/>
          </div>

          {/* Client + Date */}
          <div className="sdm-row-2">
            <div className="sdm-field">
              <label className="sdm-label">Client Name <span className="sdm-opt">optional</span></label>
              <input className="sdm-input" type="text" value={form.clientName}
                onChange={e => set('clientName', e.target.value)} placeholder="e.g. John Smith"/>
            </div>
            <div className="sdm-field">
              <label className="sdm-label">Date</label>
              <input className="sdm-input sdm-input-readonly" type="text" value={form.date} readOnly/>
            </div>
          </div>

          {/* Design Style + Room Type */}
          <div className="sdm-row-2">
            <div className="sdm-field">
              <label className="sdm-label">Design Style <span className="sdm-opt">optional</span></label>
              <select className="sdm-select" value={form.designStyle}
                onChange={e => set('designStyle', e.target.value)}>
                {DESIGN_STYLES.map(s => (
                  <option key={s} value={s}>{s || 'Select style…'}</option>
                ))}
              </select>
              {form.designStyle && (
                <span className="sdm-tag sdm-tag-style">{form.designStyle}</span>
              )}
            </div>
            <div className="sdm-field">
              <label className="sdm-label">Room Type <span className="sdm-opt">optional</span></label>
              <select className="sdm-select" value={form.roomType}
                onChange={e => set('roomType', e.target.value)}>
                {ROOM_TYPES.map(r => (
                  <option key={r} value={r}>{r || 'Select room type…'}</option>
                ))}
              </select>
              {form.roomType && (
                <span className="sdm-tag sdm-tag-room">{form.roomType}</span>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="sdm-field">
            <label className="sdm-label">Status</label>
            <div className="sdm-status-pills">
              {['Draft', 'Published'].map(s => (
                <button key={s} type="button"
                  className={`sdm-pill ${form.status === s ? 'sdm-pill-active' : ''}`}
                  onClick={() => set('status', s)}>
                  <span className={`sdm-pill-dot ${s === 'Published' ? 'published' : 'draft'}`}/>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Finalized */}
          <div className="sdm-field">
            <label className="sdm-check-row" onClick={() => set('isFinalized', !form.isFinalized)}>
              <span className={`sdm-checkbox ${form.isFinalized ? 'checked' : ''}`}>
                {form.isFinalized && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </span>
              <div className="sdm-check-text">
                <span className="sdm-check-title">Mark as Finalized</span>
                <span className="sdm-check-hint">Design is complete and client-approved</span>
              </div>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="sdm-footer">
          <button className="sdm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sdm-btn-save" onClick={() => onConfirm(form)}
            disabled={isSaving || !form.name.trim()}>
            {isSaving
              ? <><span className="sdm-spinner"/> Saving…</>
              : <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save to Library
                </>
            }
          </button>
        </div>

      </div>
    </div>
  );
};

export default SaveDesignModal;