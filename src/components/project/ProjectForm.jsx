import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MemberSuggest from './MemberSuggest';
import LocaleDatePicker from '../common/LocaleDatePicker';
import { useTranslate, useLanguage } from '../../context/LanguageContext';
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

export default function ProjectForm({ isEdit = false, projectId: propProjectId }) {
  const t = useTranslate();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const params = useParams();
  const targetId = propProjectId || params.id || params.projectNumber;
  const { groups, employees, createProject, updateProject, getProjectById, loadGroups } = useProjects();

  const [errorMessage, setErrorMessage] = useState('');
  const [projectEmployees, setProjectEmployees] = useState([]);
  const projectIdRef = useRef(null);

  const {
    register,
    control,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    mode: 'onChange',
    defaultValues: {
      projectNumber: '',
      name: '',
      customer: '',
      groupId: '',
      members: '',
      status: 'NEW',
      startDate: '',
      endDate: '',
      version: 1,
    },
  });

  useEffect(() => {
    setErrorMessage('');
  }, [language]);

  useEffect(() => {
    if (!isEdit && groups.length > 0) {
      setValue('groupId', String(groups[0].id));
    }
  }, [groups, isEdit, setValue]);

  useEffect(() => {
    loadGroups();
    if (!isEdit) {
      if (projectIdRef.current === 'new') return;
      projectIdRef.current = 'new';
      setProjectEmployees([]);
      setErrorMessage('');
      reset({
        projectNumber: '',
        name: '',
        customer: '',
        groupId: groups[0]?.id ? String(groups[0].id) : '',
        members: '',
        status: 'NEW',
        startDate: '',
        endDate: '',
        version: 1,
      });
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const proj = await getProjectById(targetId);
        if (!isMounted) return;
        if (!proj) return navigate('/error?detail=Project+not+found', { replace: true });

        projectIdRef.current = proj.id ?? targetId;
        setProjectEmployees(Array.isArray(proj.employees) ? proj.employees : Array.from(proj.employees || []));

        reset({
          projectNumber: String(proj.projectNumber ?? ''),
          name: proj.name || '',
          customer: proj.customer || '',
          groupId: String(proj.group?.id || proj.groupId || ''),
          members: (proj.employees || proj.members || [])
            .map((m) => (typeof m === 'string' ? m : m.visa))
            .filter(Boolean)
            .join(', ') || (typeof proj.members === 'string' ? proj.members : ''),
          status: (proj.status || 'NEW').toUpperCase(),
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
          version: proj.version ?? 1,
        });
      } catch (err) {
        if (isMounted) navigate(`/error?detail=${encodeURIComponent(err.message || 'Error')}`, { replace: true });
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, targetId, getProjectById, reset, navigate, loadGroups]);

  const onSubmit = async (data) => {
    setErrorMessage('');
    try {
      const payload = { ...data, status: (data.status || 'NEW').toUpperCase() };
      if (isEdit) {
        await updateProject(projectIdRef.current, payload);
      } else {
        await createProject(payload);
      }
      navigate('/');
    } catch (err) {
      if (err.status >= 500) return navigate(`/error?detail=${encodeURIComponent(err.message || 'Error')}`);
      const code = err.errorCode || err.code;

      let msg = err.message || t('common.unexpectedError');
      if (code === 'DUPLICATE_NUMBER' || code === 'PROJECT_NUMBER_ALREADY_EXISTS' || err.errors?.projectNumber) {
        setError('projectNumber', { type: 'manual' });
        msg = t('projectForm.duplicateNumber');
      } else if (code === 'INVALID_END_DATE' || err.errors?.endDate) {
        setError('endDate', { type: 'manual' });
        msg = t('projectForm.invalidEndDate');
      } else if (code === 'INVALID_VISAS' || code === 'VISA_NOT_FOUND' || err.errors?.visas) {
        setError('members', { type: 'manual' });
        msg = err.message || err.errors?.visas || 'Invalid visas';
      }
      setErrorMessage(msg);
    }
  };

  const onFormError = (formErrors) => {
    const isEndDateOnly = formErrors.endDate && !['projectNumber', 'name', 'customer', 'groupId', 'startDate'].some((f) => formErrors[f]);
    setErrorMessage(isEndDateOnly ? t('projectForm.invalidEndDate') : t('projectForm.mandatoryNotice'));
  };

  const renderTextRow = (id, name, labelKey, max, size = 'input-lg', type = 'text', extra = {}) => (
    <FormRow label={t(`projectForm.${labelKey}`)} required htmlFor={id}>
      <input
        id={id}
        type={type}
        maxLength={max}
        className={`pim-input ${size} align-left ${errors[name] ? 'field-error' : ''} ${extra.className || ''}`}
        {...register(name)}
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
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="pim-form-body" noValidate>
        {renderTextRow('projectNumber', 'projectNumber', 'projectNumber', undefined, 'input-sm', 'text', {
          disabled: isEdit,
          className: isEdit ? 'readonly-field' : '',
          onKeyDown: (e) => {
            if (['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) || e.ctrlKey || e.metaKey) return;
            if (!/[0-9]/.test(e.key)) e.preventDefault();
          },
        })}
        {renderTextRow('projectName', 'name', 'projectName', '50')}
        {renderTextRow('customer', 'customer', 'customer', '50')}

        <FormRow label={t('projectForm.group')} required htmlFor="group">
          <Controller
            name="groupId"
            control={control}
            render={({ field }) => (
              <select
                id="group"
                className={`pim-select input-md ${errors.groupId ? 'field-error' : ''}`}
                value={field.value || ''}
                onChange={field.onChange}
              >
                <option value="">{t('projectForm.selectGroup')}</option>
                {groups.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.groupLeader?.visa || g.leaderVisa || g.name}
                  </option>
                ))}
              </select>
            )}
          />
        </FormRow>

        <FormRow label={t('projectForm.members')} width="480px">
          <Controller
            name="members"
            control={control}
            render={({ field }) => (
              <MemberSuggest
                value={field.value || ''}
                onChange={field.onChange}
                employees={employees}
                initialEmployees={projectEmployees}
                hasError={Boolean(errors.members)}
              />
            )}
          />
        </FormRow>

        <FormRow label={t('projectForm.status')} required htmlFor="status">
          <select id="status" className={`pim-select input-md ${errors.status ? 'field-error' : ''}`} {...register('status')}>
            {['NEW', 'PLA', 'INP', 'FIN'].map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
        </FormRow>

        <FormRow label={t('projectForm.startDate')} required htmlFor="startDate">
          <div className="date-row-container">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <LocaleDatePicker
                  id="startDate"
                  className={errors.startDate ? 'field-error' : ''}
                  hasError={Boolean(errors.startDate)}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="date-group">
              <label className="date-label" htmlFor="endDate">{t('projectForm.endDate')}</label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <LocaleDatePicker
                    id="endDate"
                    className={errors.endDate ? 'field-error' : ''}
                    hasError={Boolean(errors.endDate)}
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </FormRow>

        <hr className="pim-divider" style={{ marginTop: '36px' }} />
        <div className="form-actions-row">
          <button
            type="button"
            className="btn-pim-secondary"
            onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'))}
          >
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
