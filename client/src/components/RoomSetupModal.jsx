import React, { useEffect, useState } from 'react';
import { listRoomTemplates } from '../services/roomApi';
import '../styles/RoomSetupModal.css';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TemplateIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const CreateIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const SHAPES = ['Rectangular', 'Square', 'L-Shape'];
const MATERIALS = ['Wood', 'Tile', 'Carpet', 'Concrete', 'Laminate', 'Marble', 'Vinyl'];

const RoomPreviewSvg = ({ shape, widthM, lengthM, floorColor, wallColor }) => {
  const scale = 40;
  const w = Math.max(widthM, 1) * scale;
  const l = Math.max(lengthM, 1) * scale;
  const pad = 10;

  let points;
  if (shape === 'L-Shape') {
    const hw = w / 2;
    const hl = l / 2;
    points = `${pad},${pad} ${pad + w},${pad} ${pad + w},${pad + hl} ${pad + hw},${pad + hl} ${pad + hw},${pad + l} ${pad},${pad + l}`;
  } else {
    points = `${pad},${pad} ${pad + w},${pad} ${pad + w},${pad + l} ${pad},${pad + l}`;
  }

  return (
    <svg width={w + pad * 2} height={l + pad * 2} style={{ maxWidth: '100%', maxHeight: 140 }}>
      <polygon points={points} fill={floorColor || '#F5F0E8'} stroke={wallColor || '#8B7355'} strokeWidth="3" />
    </svg>
  );
};

const RoomSetupModal = ({ onRoomLoaded, onClose }) => {
  const [step, setStep] = useState('choice'); // 'choice' | 'template' | 'create'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Create room form
  const [form, setForm] = useState({
    name: 'My Room',
    shape: 'Rectangular',
    width: '4',
    length: '4',
    height: '2.8',
    floorMaterial: 'Wood',
    floorColor: '#C8A882',
    wallColor: '#F5F5F0',
  });

  useEffect(() => {
    if (step !== 'template') return;
    setLoading(true);
    listRoomTemplates({ limit: 50 })
      .then((res) => setTemplates(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [step]);

  const handleTemplateUpload = (template) => {
    const roomData = {
      isTemplate: true,
      templateId: template._id,
      name: template.name,
      shape: template.shape,
      dimensions: template.dimensions,
      floorMaterial: template.floorMaterial,
      floorColor: template.floorColors?.[0] || '#C8A882',
      floorColors: template.floorColors || ['#C8A882'],
      wallColor: template.wallColors?.[0] || '#F5F5F0',
      wallColors: template.wallColors || ['#F5F5F0'],
      activeFloorColor: template.floorColors?.[0] || '#C8A882',
      activeWallColor: template.wallColors?.[0] || '#F5F5F0',
    };
    onRoomLoaded(roomData);
  };

  const handleCreateUpload = () => {
    const roomData = {
      isTemplate: false,
      name: form.name || 'My Room',
      shape: form.shape,
      dimensions: {
        width: Number(form.width) || 4,
        length: Number(form.length) || 4,
        height: Number(form.height) || 2.8,
      },
      floorMaterial: form.floorMaterial,
      floorColor: form.floorColor,
      floorColors: [form.floorColor],
      wallColor: form.wallColor,
      wallColors: [form.wallColor],
      activeFloorColor: form.floorColor,
      activeWallColor: form.wallColor,
    };
    onRoomLoaded(roomData);
  };

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="rsm-overlay">
      <div className="rsm-modal">
        <div className="rsm-header">
          <h2 className="rsm-title">
            {step === 'choice' && 'Start Your Design'}
            {step === 'template' && 'Choose a Template'}
            {step === 'create' && 'Create a Room'}
          </h2>
          {step !== 'choice' && (
            <button className="rsm-back" onClick={() => setStep('choice')}>← Back</button>
          )}
          <button className="rsm-close" onClick={onClose}><CloseIcon /></button>
        </div>

        {step === 'choice' && (
          <div className="rsm-choice">
            <p className="rsm-subtitle">Choose how you'd like to set up your room</p>
            <div className="rsm-choice-cards">
              <button className="rsm-choice-card" onClick={() => setStep('template')}>
                <div className="rsm-choice-icon"><TemplateIcon /></div>
                <h3>Use Template</h3>
                <p>Pick from existing room templates</p>
              </button>
              <button className="rsm-choice-card" onClick={() => setStep('create')}>
                <div className="rsm-choice-icon"><CreateIcon /></div>
                <h3>Create Room</h3>
                <p>Define custom dimensions and style</p>
              </button>
            </div>
          </div>
        )}

        {step === 'template' && (
          <div className="rsm-templates">
            {loading && <p className="rsm-loading">Loading templates...</p>}
            {!loading && templates.length === 0 && (
              <p className="rsm-empty">No room templates available.</p>
            )}
            <div className="rsm-template-grid">
              {templates.map((t) => (
                <div
                  key={t._id}
                  className={`rsm-template-card ${selectedTemplate?._id === t._id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(t)}
                >
                  <div className="rsm-template-preview">
                    <RoomPreviewSvg
                      shape={t.shape}
                      widthM={t.dimensions?.width || 4}
                      lengthM={t.dimensions?.length || 4}
                      floorColor={t.floorColors?.[0]}
                      wallColor={t.wallColors?.[0]}
                    />
                  </div>
                  <div className="rsm-template-info">
                    <h4>{t.name}</h4>
                    <p>{t.shape} · {t.dimensions?.width}m × {t.dimensions?.length}m × {t.dimensions?.height}m</p>
                    <p className="rsm-template-material">{t.floorMaterial || 'No material'}</p>
                    <div className="rsm-swatch-row">
                      {(t.wallColors || []).slice(0, 4).map((c) => (
                        <span key={c} className="rsm-swatch" style={{ backgroundColor: c }} title={`Wall: ${c}`} />
                      ))}
                      {(t.floorColors || []).slice(0, 4).map((c) => (
                        <span key={c} className="rsm-swatch floor" style={{ backgroundColor: c }} title={`Floor: ${c}`} />
                      ))}
                    </div>
                    <span className={`rsm-badge ${t.status === 'Published' ? 'pub' : 'draft'}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <div className="rsm-footer">
                <button className="rsm-upload-btn" onClick={() => handleTemplateUpload(selectedTemplate)}>
                  Upload to Canvas
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'create' && (
          <div className="rsm-create-form">
            <div className="rsm-form-cols">
              <div className="rsm-form-left">
                <div className="rsm-field">
                  <label>Room Name</label>
                  <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Living Room" />
                </div>

                <div className="rsm-field">
                  <label>Shape</label>
                  <div className="rsm-shape-grid">
                    {SHAPES.map((s) => (
                      <button
                        key={s}
                        className={`rsm-shape-btn ${form.shape === s ? 'active' : ''}`}
                        onClick={() => setField('shape', s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rsm-dims-row">
                  {[
                    { key: 'width', label: 'Width' },
                    { key: 'length', label: 'Length' },
                    { key: 'height', label: 'Height' },
                  ].map(({ key, label }) => (
                    <div key={key} className="rsm-field rsm-dim-field">
                      <label>{label} (m)</label>
                      <input
                        type="number" min="1" max="30" step="0.1"
                        value={form[key]}
                        onChange={(e) => setField(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="rsm-field">
                  <label>Floor Material</label>
                  <select value={form.floorMaterial} onChange={(e) => setField('floorMaterial', e.target.value)}>
                    {MATERIALS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>

                <div className="rsm-color-row">
                  <div className="rsm-field rsm-color-field">
                    <label>Floor Color</label>
                    <div className="rsm-color-pick">
                      <input type="color" value={form.floorColor} onChange={(e) => setField('floorColor', e.target.value)} />
                      <span>{form.floorColor}</span>
                    </div>
                  </div>
                  <div className="rsm-field rsm-color-field">
                    <label>Wall Color</label>
                    <div className="rsm-color-pick">
                      <input type="color" value={form.wallColor} onChange={(e) => setField('wallColor', e.target.value)} />
                      <span>{form.wallColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rsm-form-right">
                <div className="rsm-preview-box">
                  <p className="rsm-preview-label">Preview</p>
                  <RoomPreviewSvg
                    shape={form.shape}
                    widthM={Number(form.width) || 4}
                    lengthM={Number(form.length) || 4}
                    floorColor={form.floorColor}
                    wallColor={form.wallColor}
                  />
                  <p className="rsm-preview-dims">
                    {form.width}m × {form.length}m × {form.height}m
                  </p>
                </div>
              </div>
            </div>

            <div className="rsm-footer">
              <button className="rsm-upload-btn" onClick={handleCreateUpload}>
                Upload to Canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSetupModal;