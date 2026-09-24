import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import MemberSuggest from './MemberSuggest';
import LocaleDatePicker from '../common/LocaleDatePicker';
import { useTranslate } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';

const projectSchema = z
  .object({
    projectNumber: z.string().trim().min(1, 'required'),
    name: z.string().trim().min(1, 'required'),
    customer: z.string().trim().min(1, 'required'),
    groupId: z.string().trim().min(1, 'required'),
    members: z.string().optional().default(''),
    status: z.string().default('NEW'),
    startDate: z.string().trim().min(1, 'required'),
    endDate: z.string().optional().default(''),
    version: z.number().default(1),
  })
  .refine(
    (d) => !d.endDate || !d.startDate || new Date(d.endDate) > new Date(d.startDate),
    { message: 'invalid_end_date', path: ['endDate'] }
  );

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
  const t = useTranslate();
  const navigate = useNavigate();
  const { projectNumber } = useParams();
  const { groups, employees, createProject, updateProject, getProjectByNumber, loadGroups, loadEmployees } = useProjects();

  useEffect(() => { loadGroups(); }, [loadGroups]);
  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const [errorMessage, setErrorMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, setValue, watch, reset } = useForm({
    defaultValues: {
      projectNumber: '',
      name: '',
      customer: '',
      groupId: groups[0]?.id ? String(groups[0].id) : '',
      members: '',
      status: 'NEW',
      startDate: '',
      endDate: '',
      version: 1,
    },
  });

  const formData = watch();

  const projectIdRef = useRef(null);

  useEffect(() => {
    if (!isEdit || !projectNumber) return;
    const proj = getProjectByNumber(projectNumber);
    if (!proj) return navigate('/error?detail=Project+not+found', { replace: true });

    projectIdRef.current = proj.id || proj.projectNumber; // fallback to projectNumber if id is missing

    const members = (proj.employees || proj.members || []).map((m) => (typeof m === 'string' ? m : m.visa)).join(', ') || proj.members || '';
    reset({
      projectNumber: String(proj.projectNumber),
      name: proj.name || '',
      customer: proj.customer || '',
      groupId: String(proj.group?.id || proj.groupId || ''),
      members,
      status: (proj.status || 'NEW').toUpperCase(),
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      version: proj.version ?? 1,
    });
  }, [isEdit, projectNumber, getProjectByNumber, reset, navigate]);

  useEffect(() => {
    if (!isEdit && groups.length && !formData.groupId) setValue('groupId', String(groups[0].id));
  }, [isEdit, groups, formData.groupId, setValue]);

  const handleChange = (field, val) => {
    setValue(field, val);
    if (errorFields[field]) setErrorFields((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const result = projectSchema.safeParse(watch());

    if (!result.success) {
      const errMap = {};
      result.error.issues.forEach((i) => { if (i.path[0]) errMap[i.path[0]] = true; });
      setErrorFields(errMap);
      return setErrorMessage(errMap.endDate ? t('projectForm.invalidEndDate') : t('projectForm.mandatoryNotice'));
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setErrorFields({});

    try {
      const payload = { ...result.data, status: (result.data.status || 'NEW').toUpperCase() };
      if (isEdit) {
        await updateProject(projectIdRef.current, payload);
      } else {
        await createProject(payload);
      }
      navigate('/');
    } catch (err) {
      setIsSubmitting(false);
      if (err.status >= 500) return navigate(`/error?detail=${encodeURIComponent(err.message || 'Error')}`);
      const code = err.errorCode || err.code;
      const isDup = code === 'DUPLICATE_NUMBER' || code === 'PROJECT_NUMBER_ALREADY_EXISTS';
      const isVisa = code === 'INVALID_VISAS' || code === 'VISA_NOT_FOUND';
      const isDate = code === 'INVALID_END_DATE';
      const field = isDup ? 'projectNumber' : isVisa ? 'members' : isDate ? 'endDate' : '';
      if (field) setErrorFields((prev) => ({ ...prev, [field]: true }));
      setErrorMessage(isDup ? t('projectForm.duplicateNumber') : isDate ? t('projectForm.invalidEndDate') : err.message || t('common.unexpectedError'));
    }
  };

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
