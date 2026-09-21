import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  const { t } = useLanguage();
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (confirmBtnRef.current) confirmBtnRef.current.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="pim-modal-backdrop" onClick={onCancel}>
      <div className="pim-modal-box" onClick={(e) => e.stopPropagation()}>
        {title && <div className="pim-modal-header">{title}</div>}
        <div className="pim-modal-body">{message}</div>
        <div className="pim-modal-footer">
          <button type="button" className="btn-pim-secondary" onClick={onCancel} style={{ height: 32, padding: '0 16px', fontSize: 13 }}>
            {cancelText || t('common.cancel')}
          </button>
          <button ref={confirmBtnRef} type="button" className="btn-pim-danger" onClick={onConfirm} style={{ height: 32, padding: '0 16px', fontSize: 13 }}>
            {confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
