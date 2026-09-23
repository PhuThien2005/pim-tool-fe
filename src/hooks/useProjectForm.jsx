import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLanguage } from '../context/LanguageContext';
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
    (data) => {
      if (!data.endDate || !data.startDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: 'invalid_end_date',
      path: ['endDate'],
    }
  );

export function useProjectForm(isEdit = false) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const history = useMemo(
    () => ({
      push: (path) => navigate(path),
      replace: (path) => navigate(path, { replace: true }),
    }),
    [navigate]
  );
  const { projectNumber } = useParams();
  const {
    groups: contextGroups,
    employees: contextEmployees,
    createProject,
    updateProject,
    getProjectByNumber,
    loadGroups,
  } = useProjects();

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const groups = contextGroups && contextGroups.length ? contextGroups : projectService.getGroups();
  const employees = contextEmployees && contextEmployees.length ? contextEmployees : projectService.getEmployees();

  const [errorMessage, setErrorMessage] = useState('');
  const [clientErrorFields, setClientErrorFields] = useState({});
  const [serverErrorFields, setServerErrorFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      projectNumber: '',
      name: '',
      customer: '',
      groupId: groups.length > 0 ? String(groups[0].id) : '',
      members: '',
      status: 'NEW',
      startDate: '',
      endDate: '',
      version: 1,
    },
  });

  const formData = watch();

  // Load project in Edit mode
  useEffect(() => {
    if (!isEdit || !projectNumber) return;

    const fillForm = (data) => {
      const members = Array.isArray(data.employees) && data.employees.length
        ? data.employees.map((e) => (typeof e === 'string' ? e : e.visa)).join(', ')
        : Array.isArray(data.members)
        ? data.members.map((m) => (typeof m === 'string' ? m : m.visa)).join(', ')
        : data.members || '';

      reset({
        projectNumber: String(data.projectNumber),
        name: data.name || '',
        customer: data.customer || '',
        groupId: String(data.group?.id || data.groupId || ''),
        members,
        status: (data.status || 'NEW').toUpperCase(),
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        version: data.version !== undefined ? data.version : 1,
      });
    };

    const existing = getProjectByNumber(projectNumber);
    if (existing) fillForm(existing);

    if (process.env.NODE_ENV !== 'test') {
      const fetchFromApi = async () => {
        try {
          let targetId = existing?.id;
          if (!targetId) {
            const searchRes = await projectService.searchProjectsApi(
              { searchTerm: String(projectNumber) },
              { page: 0, size: 5, sort: 'projectNumber,asc' }
            );
            const match = searchRes?.content?.find((p) => p.projectNumber === +projectNumber || p.id === +projectNumber);
            targetId = match?.id;
          }
          if (targetId) {
            const detail = await projectService.getProjectApi(targetId);
            if (detail) fillForm(detail);
          } else if (!existing) {
            navigate('/error?detail=Project+not+found', { replace: true });
          }
        } catch {
          if (!existing) {
            navigate('/error?detail=Project+not+found', { replace: true });
          }
        }
      };
      fetchFromApi();
    } else if (!existing) {
      navigate('/error?detail=Project+not+found', { replace: true });
    }
  }, [isEdit, projectNumber, getProjectByNumber, navigate, reset]);

  useEffect(() => {
    if (!isEdit && groups.length > 0 && !formData.groupId) {
      setValue('groupId', String(groups[0].id));
    }
  }, [isEdit, groups, formData.groupId, setValue]);

  const handleChange = (field, value) => {
    setValue(field, value);
    if (clientErrorFields[field]) {
      setClientErrorFields((prev) => ({ ...prev, [field]: false }));
    }
    if (serverErrorFields[field]) {
      setServerErrorFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const onValid = (data) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setClientErrorFields({});
    setServerErrorFields({});

    const payload = {
      ...data,
      status: (data.status || 'NEW').toUpperCase(),
    };

    try {
      if (isEdit) {
        updateProject(projectNumber, payload);
      } else {
        createProject(payload);
      }
      navigate('/');
    } catch (err) {
      setIsSubmitting(false);

      if (err.status >= 500) {
        navigate(`/error?detail=${encodeURIComponent(err.message || 'Internal Server Error')}`);
        return;
      }

      const code = err.errorCode || err.code;
      const codeMap = {
        DUPLICATE_NUMBER: { f: 'projectNumber', m: t('projectForm.duplicateNumber') },
        PROJECT_NUMBER_ALREADY_EXISTS: { f: 'projectNumber', m: t('projectForm.duplicateNumber') },
        INVALID_VISAS: { f: 'members', m: err.message },
        VISA_NOT_FOUND: { f: 'members', m: err.message },
        INVALID_END_DATE: { f: 'endDate', m: t('projectForm.invalidEndDate') },
        OPTIMISTIC_LOCK_ERROR: { f: '', m: err.message || 'The project has been modified by another user. Please refresh and try again.' },
        VALIDATION_ERROR: { f: '', m: t('projectForm.mandatoryNotice') },
      };

      const hit = codeMap[code] || { f: '', m: err.message || t('common.unexpectedError') };
      if (hit.f) setServerErrorFields((prev) => ({ ...prev, [hit.f]: true }));

      if (err.errors) {
        const serverFields = {};
        Object.keys(err.errors).forEach((k) => {
          if (k === 'visas') serverFields.members = true;
          else serverFields[k] = true;
        });
        setServerErrorFields((prev) => ({ ...prev, ...serverFields }));
      }

      setErrorMessage(hit.m);
    }
  };

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const currentValues = watch();
    const result = projectSchema.safeParse(currentValues);

    if (!result.success) {
      const fieldErrors = {};
      (result.error?.issues || []).forEach((issue) => {
        const field = issue.path[0];
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = true;
        }
      });
      setClientErrorFields(fieldErrors);

      const requiredKeys = ['projectNumber', 'name', 'customer', 'groupId', 'status', 'startDate'];
      const hasMissingRequired = requiredKeys.some((k) => fieldErrors[k]);

      if (hasMissingRequired) {
        setErrorMessage(t('projectForm.mandatoryNotice'));
      } else if (fieldErrors.endDate) {
        setErrorMessage(t('projectForm.invalidEndDate'));
      } else {
        setErrorMessage(t('projectForm.mandatoryNotice'));
      }
      return;
    }

    onValid(result.data);
  };

  const errorFields = {
    projectNumber: Boolean(clientErrorFields.projectNumber || serverErrorFields.projectNumber),
    name: Boolean(clientErrorFields.name || serverErrorFields.name),
    customer: Boolean(clientErrorFields.customer || serverErrorFields.customer),
    groupId: Boolean(clientErrorFields.groupId || serverErrorFields.groupId),
    members: Boolean(clientErrorFields.members || serverErrorFields.members),
    status: Boolean(clientErrorFields.status || serverErrorFields.status),
    startDate: Boolean(clientErrorFields.startDate || serverErrorFields.startDate),
    endDate: Boolean(clientErrorFields.endDate || serverErrorFields.endDate),
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
