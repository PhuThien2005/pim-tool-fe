import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslate } from '../context/LanguageContext';
import { useProjects } from '../context/ProjectContext';
import { projectService } from '../services/projectService';

export const projectSchema = z
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

export function useProjectForm(isEdit = false) {
  const t = useTranslate();
  const navigate = useNavigate();
  const history = useMemo(() => ({ push: navigate, replace: (p) => navigate(p, { replace: true }) }), [navigate]);
  const { projectNumber } = useParams();
  const { groups: ctxGroups, employees: ctxEmps, createProject, updateProject, getProjectByNumber, loadGroups } = useProjects();

  useEffect(() => { loadGroups(); }, [loadGroups]);
  const groups = ctxGroups?.length ? ctxGroups : projectService.getGroups();
  const employees = ctxEmps?.length ? ctxEmps : projectService.getEmployees();

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

  useEffect(() => {
    if (!isEdit || !projectNumber) return;
    const proj = getProjectByNumber(projectNumber);
    if (!proj) return navigate('/error?detail=Project+not+found', { replace: true });
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

  const handleSubmit = (e) => {
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
      isEdit ? updateProject(projectNumber, payload) : createProject(payload);
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

  return {
    t,
    navigate,
    history,
    isEdit,
    formData,
    errorMessage,
    setErrorMessage,
    errorFields,
    isSubmitting,
    groups,
    employees,
    register,
    setValue,
    handleChange,
    handleSubmit,
  };
}

export default useProjectForm;
