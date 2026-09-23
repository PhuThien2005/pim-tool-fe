import React from 'react';
import MemberSuggest from './MemberSuggest';
import LocaleDatePicker from '../common/LocaleDatePicker';
import { useProjectForm } from '../../hooks/useProjectForm';

const FormRow = ({ label, required, htmlFor, children, width }) => (
  <div className="form-row-custom">
    <label className="form-label-col" htmlFor={htmlFor}>
      {label}{required && <span className="required-asterisk">*</span>}
    </label>
    <div className="form-input-col" style={width ? { width, maxWidth: '100%' } : undefined}>
      {children}
    </div>
  </div>
);

export default function ProjectForm({ isEdit = false }) {
  const {
    t, navigate, formData, errorMessage, setErrorMessage, errorFields,
    isSubmitting, groups, employees, handleChange, handleGroupScroll, handleSubmit,
  } = useProjectForm(isEdit);

  const renderTextRow = (id, field, labelKey, max, size = 'input-lg', type = 'text', extra = {}) => (
    <FormRow label={t(`projectForm.${labelKey}`)} required htmlFor={id}>
      <input
        id={id}
        type={type}
        maxLength={max}
        className={`pim-input ${size} align-left ${errorFields[field] ? 'field-error' : ''} ${extra.className || ''}`}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        {...extra}
      />
    </FormRow>
  );

  return (
    <div className="pim-project-form-container">
      <h2 className="pim-form-title">{isEdit ? t('projectForm.editTitle') : t('projectForm.newTitle')}</h2>
      <hr className="pim-divider" />
      {errorMessage && (
        <div className="error-banner" role="alert">
          <span>{errorMessage}</span>
          <button type="button" className="error-banner-close" onClick={() => setErrorMessage('')} title="Close">✕</button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="pim-form-body">
        {renderTextRow('projectNumber', 'projectNumber', 'projectNumber', undefined, 'input-sm', 'number', {
          min: '1', max: '9999', disabled: isEdit, placeholder: 'e.g. 1001', className: isEdit ? 'readonly-field' : '',
        })}
        {renderTextRow('projectName', 'name', 'projectName', '50')}
        {renderTextRow('customer', 'customer', 'customer', '50')}

        <FormRow label={t('projectForm.group')} required htmlFor="group">
          <select
            id="group"
            className={`pim-select input-md ${errorFields.groupId ? 'field-error' : ''}`}
            value={formData.groupId}
            onChange={(e) => handleChange('groupId', e.target.value)}
            onScroll={handleGroupScroll}
          >
            <option value="">{t('projectForm.selectGroup')}</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.groupLeader?.visa || g.leaderVisa || g.name}</option>)}
          </select>
        </FormRow>

        <FormRow label={t('projectForm.members')} width="480px">
          <MemberSuggest value={formData.members} onChange={(v) => handleChange('members', v)} employees={employees} hasError={errorFields.members} />
        </FormRow>

        <FormRow label={t('projectForm.status')} required htmlFor="status">
          <select
            id="status"
            className={`pim-select input-md ${errorFields.status ? 'field-error' : ''}`}
            value={formData.status}
            onChange={(e) => handleChange('status', (e.target.value || '').toUpperCase())}
          >
            {['NEW', 'PLA', 'INP', 'FIN'].map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </select>
        </FormRow>

        <FormRow label={t('projectForm.startDate')} required htmlFor="startDate">
          <div className="date-row-container">
            <LocaleDatePicker id="startDate" className={errorFields.startDate ? 'field-error' : ''} hasError={Boolean(errorFields.startDate)} value={formData.startDate} onChange={(v) => handleChange('startDate', v)} />
            <div className="date-group">
              <label className="date-label" htmlFor="endDate">{t('projectForm.endDate')}</label>
              <LocaleDatePicker id="endDate" className={errorFields.endDate ? 'field-error' : ''} hasError={Boolean(errorFields.endDate)} value={formData.endDate} onChange={(v) => handleChange('endDate', v)} />
            </div>
          </div>
        </FormRow>

        <hr className="pim-divider" style={{ marginTop: '36px' }} />
        <div className="form-actions-row">
          <button type="button" className="btn-pim-secondary" onClick={() => navigate('/')}>{t('projectForm.cancel')}</button>
          <button type="submit" className="btn-pim-primary" disabled={isSubmitting}>{isEdit ? t('projectForm.editProject') : t('projectForm.createProject')}</button>
        </div>
      </form>
    </div>
  );
}
