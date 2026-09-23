import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProjects } from '../context/ProjectContext';
import { projectService } from '../services/projectService';

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

  const [formData, setFormData] = useState({
    projectNumber: '',
    name: '',
    customer: '',
    groupId: groups.length > 0 ? String(groups[0].id) : '',
    members: '',
    status: 'NEW',
    startDate: '',
    endDate: '',
    version: 1,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [errorFields, setErrorFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slice<GroupListResponse> state for infinite scroll dropdown
  const [groupsPage, setGroupsPage] = useState(0);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const groupScrollTimerRef = useRef(null);

  // Load project in Edit mode
  useEffect(() => {
    if (!isEdit || !projectNumber) return;

    const fillForm = (data) => {
      const members = Array.isArray(data.employees) && data.employees.length
        ? data.employees.map((e) => (typeof e === 'string' ? e : e.visa)).join(', ')
        : Array.isArray(data.members)
        ? data.members.map((m) => (typeof m === 'string' ? m : m.visa)).join(', ')
        : data.members || '';

      setFormData({
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

    // Try localStorage first for immediate render
    const existing = getProjectByNumber(projectNumber);
    if (existing) fillForm(existing);

    // Then call API for latest data (needs projectId, search by projectNumber)
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
            history.replace('/error?detail=Project+not+found');
          }
        } catch {
          if (!existing) {
            history.replace('/error?detail=Project+not+found');
          }
        }
      };
      fetchFromApi();
    } else if (!existing) {
      history.replace('/error?detail=Project+not+found');
    }
  }, [isEdit, projectNumber, getProjectByNumber, history]);

  useEffect(() => {
    if (!isEdit && groups.length > 0 && !formData.groupId) {
      setFormData((prev) => ({ ...prev, groupId: String(groups[0].id) }));
    }
  }, [isEdit, groups, formData.groupId]);

  // Debounced scroll listener for Slice<GroupListResponse> dropdown
  const handleGroupScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 15) {
      if (!hasMoreGroups || loadingGroups || process.env.NODE_ENV === 'test') return;
      if (groupScrollTimerRef.current) clearTimeout(groupScrollTimerRef.current);
      groupScrollTimerRef.current = setTimeout(async () => {
        if (!hasMoreGroups || loadingGroups) return;
        try {
          setLoadingGroups(true);
          const nextPage = groupsPage + 1;
          const slice = await projectService.getGroupsApi({ page: nextPage, size: 20, sort: 'id,asc' });
          if (slice && Array.isArray(slice.content) && slice.content.length > 0) {
            setGroupsPage(nextPage);
            setHasMoreGroups(!slice.last && slice.numberOfElements > 0);
          } else {
            setHasMoreGroups(false);
          }
        } catch {
          setHasMoreGroups(false);
        } finally {
          setLoadingGroups(false);
        }
      }, 200);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorFields[field]) setErrorFields((prev) => ({ ...prev, [field]: false }));
  };

  const validate = () => {
    const required = ['projectNumber', 'name', 'customer', 'groupId', 'status', 'startDate'];
    const missing = required.filter((k) => !formData[k] || !String(formData[k]).trim());
    if (missing.length) {
      setErrorFields(missing.reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      setErrorMessage(t('projectForm.mandatoryNotice'));
      return false;
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      setErrorFields({ endDate: true });
      setErrorMessage(t('projectForm.invalidEndDate'));
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');
    setErrorFields({});
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      ...formData,
      status: (formData.status || 'NEW').toUpperCase(),
    };

    try {
      if (isEdit) {
        updateProject(projectNumber, payload);
      } else {
        createProject(payload);
      }
      history.push('/');
    } catch (err) {
      setIsSubmitting(false);

      if (err.status >= 500) {
        history.push(`/error?detail=${encodeURIComponent(err.message || 'Internal Server Error')}`);
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
      if (hit.f) setErrorFields((prev) => ({ ...prev, [hit.f]: true }));

      if (err.errors) {
        const serverFields = {};
        Object.keys(err.errors).forEach((k) => {
          if (k === 'visas') serverFields.members = true;
          else serverFields[k] = true;
        });
        setErrorFields((prev) => ({ ...prev, ...serverFields }));
      }

      setErrorMessage(hit.m);
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
    handleChange,
    handleGroupScroll,
    handleSubmit,
    validate,
  };
}

export default useProjectForm;
