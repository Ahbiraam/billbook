import React, { useState } from 'react';
import type { ShopInfo } from '../types';
import { exportDataBackup } from '../utils/storage';
import { X, Save, Building, Download, ShieldCheck, HardDrive } from 'lucide-react';

interface ShopSettingsModalProps {
  shopInfo: ShopInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedInfo: ShopInfo) => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  shopInfo,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ShopInfo>({ ...shopInfo });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={22} className="text-indigo-400" />
            <h3 style={{ fontWeight: 700 }}>Store Profile & Security Settings</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Data Security Banner */}
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <ShieldCheck size={24} style={{ color: '#34d399', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>100% Private & Secured Locally</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  All your Nel Rich Foods products, sales bills, and shop data are stored safely on your laptop's local storage. They are never sent to external servers or cloud services.
                </p>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Store Business Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline / Subtitle</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City, State & Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.cityStatePincode}
                  onChange={(e) => setFormData({ ...formData, cityStatePincode: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Invoice Prefix</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Terms & Conditions (Shown on Invoice)</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              />
            </div>

            {/* Offline Data Backup Box */}
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HardDrive size={22} className="text-indigo-400" />
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Download Data Backup</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Save a full `.json` backup file of all products & bills to your drive.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-emerald btn-sm"
                onClick={exportDataBackup}
              >
                <Download size={14} /> Backup File
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              <span>Save Business Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
