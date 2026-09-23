import React from 'react';
import MemberSuggest from './MemberSuggest';
import LocaleDatePicker from '../common/LocaleDatePicker';
import { useProjectForm } from '../../hooks/useProjectForm';

const FormRow = ({ label, required, htmlFor, children, width }) => (
  <div className="form-row-custom">
    <label className="form-label-col" htmlFor={htmlFor}>
      {label}
      {required && <span className="required-asterisk">*</span>}
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
        <FormRow label={t('projectForm.projectNumber')} required htmlFor="projectNumber">
          <input
            id="projectNumber"
            type="number"
            min="1"
            max="9999"
            className={`pim-input input-sm align-left ${errorFields.projectNumber ? 'field-error' : ''} ${isEdit ? 'readonly-field' : ''}`}
            value={formData.projectNumber}
            disabled={isEdit}
            onChange={(e) => handleChange('projectNumber', e.target.value)}
            placeholder="e.g. 1001"
          />
        </FormRow>

        <FormRow label={t('projectForm.projectName')} required htmlFor="projectName">
          <input
            id="projectName"
            type="text"
            maxLength="50"
            className={`pim-input input-lg align-left ${errorFields.name ? 'field-error' : ''}`}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormRow>

        <FormRow label={t('projectForm.customer')} required htmlFor="customer">
          <input
            id="customer"
            type="text"
            maxLength="50"
            className={`pim-input input-lg align-left ${errorFields.customer ? 'field-error' : ''}`}
            value={formData.customer}
            onChange={(e) => handleChange('customer', e.target.value)}
          />
        </FormRow>

        <FormRow label={t('projectForm.group')} required htmlFor="group">
          <select
            id="group"
            className={`pim-select input-md ${errorFields.groupId ? 'field-error' : ''}`}
            value={formData.groupId}
            onChange={(e) => handleChange('groupId', e.target.value)}
            onScroll={handleGroupScroll}
          >
            <option value="">{t('projectForm.selectGroup')}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.groupLeader?.visa || g.leaderVisa || g.name}</option>
            ))}
          </select>
        </FormRow>

        <FormRow label={t('projectForm.members')} width="480px">
          <MemberSuggest
            value={formData.members}
            onChange={(val) => handleChange('members', val)}
            employees={employees}
            hasError={errorFields.members}
          />
        </FormRow>

        <FormRow label={t('projectForm.status')} required htmlFor="status">
          <select
            id="status"
            className={`pim-select input-md ${errorFields.status ? 'field-error' : ''}`}
            value={formData.status}
            onChange={(e) => handleChange('status', (e.target.value || '').toUpperCase())}
          >
            {['NEW', 'PLA', 'INP', 'FIN'].map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </select>
        </FormRow>

        <FormRow label={t('projectForm.startDate')} required htmlFor="startDate">
          <div className="date-row-container">
            <LocaleDatePicker
              id="startDate"
              className={errorFields.startDate ? 'field-error' : ''}
              hasError={Boolean(errorFields.startDate)}
              value={formData.startDate}
              onChange={(val) => handleChange('startDate', val)}
            />
            <div className="date-group">
              <label className="date-label" htmlFor="endDate">{t('projectForm.endDate')}</label>
              <LocaleDatePicker
                id="endDate"
                className={errorFields.endDate ? 'field-error' : ''}
                hasError={Boolean(errorFields.endDate)}
                value={formData.endDate}
                onChange={(val) => handleChange('endDate', val)}
              />
            </div>
          </div>
        </FormRow>

        <hr className="pim-divider" style={{ marginTop: '36px' }} />

        <div className="form-actions-row">
          <button type="button" className="btn-pim-secondary" onClick={() => navigate('/')}>
            {t('projectForm.cancel')}
          </button>
          <button type="submit" className="btn-pim-primary" disabled={isSubmitting}>
            {isEdit ? t('projectForm.editProject') : t('projectForm.createProject')}
          </button>
        </div>
      </form>
    </div>
  );
}
