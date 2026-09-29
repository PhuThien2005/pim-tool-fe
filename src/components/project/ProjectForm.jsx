import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import MemberSuggest from './MemberSuggest';
import LocaleDatePicker from '../common/LocaleDatePicker';
import {useTranslate, useLanguage} from '../../context/LanguageContext';
import {useProjects} from '../../context/ProjectContext';

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
        {message: 'invalid_end_date', path: ['endDate']}
    );

const FormRow = ({label, required, htmlFor, children, width}) => (
    <div className="form-row-custom">
        <label className="form-label-col" htmlFor={htmlFor}>
            {label}{required && <span className="required-asterisk">*</span>}
        </label>
        <div className="form-input-col" style={width ? {width, maxWidth: '100%'} : undefined}>
            {children}
        </div>
    </div>
);

export default function ProjectForm({isEdit = false, projectId: propProjectId}) {
    const t = useTranslate();
    const {language} = useLanguage();
    const navigate = useNavigate();
    const params = useParams();
    const targetId = propProjectId || params.id || params.projectNumber;
    const {groups, employees, createProject, updateProject, getProjectById, loadGroups, refreshProjects} = useProjects();

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
        formState: {errors, isSubmitting},
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
                if (!proj) return navigate('/error?detail=Project+not+found', {replace: true});

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
                if (isMounted) navigate(`/error?detail=${encodeURIComponent(err.message || 'Error')}`, {replace: true});
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
            const payload = {...data, status: (data.status || 'NEW').toUpperCase()};
            if (isEdit) {
                await updateProject(projectIdRef.current, payload);
            } else {
                await createProject(payload);
            }
            navigate('/');
        } catch (err) {
            if (err.status >= 500) return navigate(`/error?detail=${encodeURIComponent(err.message || 'Error')}`);
            const code = err.errorCode || err.code;

            // Highlight invalid fields
            if (code === 'DUPLICATE_NUMBER' || code === 'PROJECT_NUMBER_ALREADY_EXISTS' || err.errors?.projectNumber) {
                setError('projectNumber', {type: 'manual'});
            }
            if (code === 'INVALID_END_DATE' || err.errors?.endDate || err.errors?.startDate) {
                setError('endDate', {type: 'manual'});
            }
            if (code === 'INVALID_VISAS' || code === 'VISA_NOT_FOUND' || err.errors?.visas || err.invalidVisas) {
                setError('members', {type: 'manual'});
            }
            if (err.errors) {
                Object.keys(err.errors).forEach((k) => {
                    const mappedKey = k === 'visas' ? 'members' : k;
                    setError(mappedKey, {type: 'manual'});
                });
            }

            // Determine error message banner (Requirement 11)
            let msg = t('common.unexpectedError');
            const isDuplicateNumber =
                code === 'DUPLICATE_NUMBER' ||
                code === 'PROJECT_NUMBER_ALREADY_EXISTS' ||
                /already exist/i.test(err.message || '') ||
                /already exist/i.test(err.errors?.projectNumber || '');

            if (isDuplicateNumber) {
                msg = t('projectForm.duplicateNumber');
            } else if (code === 'INVALID_END_DATE' || err.errors?.endDate) {
                msg = t('projectForm.invalidEndDate');
            } else if (code === 'INVALID_VISAS' || code === 'VISA_NOT_FOUND' || err.errors?.visas || err.invalidVisas) {
                const rawBackendMsg = err.message && err.message !== 'Validation failed' ? err.message : '';
                const visaErrorText = err.errors?.visas || '';

                const rawMembers = data.members;
                const enteredVisas = (Array.isArray(rawMembers) ? rawMembers : String(rawMembers || '').split(','))
                    .map((v) => (typeof v === 'string' ? v.trim() : v?.visa?.trim() || ''))
                    .filter(Boolean);

                const invalidFormat = enteredVisas.filter((v) => !/^[A-Za-z]{3}$/.test(v));
                const knownVisas = new Set([
                    ...employees.map((e) => (e.visa || '').toUpperCase()),
                    ...projectEmployees.map((e) => (e.visa || '').toUpperCase()),
                ].filter(Boolean));

                let badList = [];
                if (err.invalidVisas && err.invalidVisas.length > 0) {
                    badList = err.invalidVisas;
                } else if (knownVisas.size > 0) {
                    const notInKnown = enteredVisas.filter((v) => !knownVisas.has(v.toUpperCase()));
                    badList = notInKnown.length > 0 ? notInKnown : enteredVisas;
                } else if (invalidFormat.length > 0) {
                    badList = invalidFormat;
                } else if (enteredVisas.length > 0) {
                    badList = enteredVisas;
                }

                if (badList.length > 0) {
                    msg = t('projectForm.invalidVisas', {visas: badList.map((v) => v.toUpperCase()).join(', ')});
                } else if (rawBackendMsg && (rawBackendMsg.toLowerCase().includes('do not exist') || rawBackendMsg.toLowerCase().includes("n'existent pas"))) {
                    msg = rawBackendMsg;
                } else if (visaErrorText && (visaErrorText.toLowerCase().includes('do not exist') || visaErrorText.toLowerCase().includes("n'existent pas"))) {
                    msg = visaErrorText;
                } else {
                    msg = t('projectForm.invalidVisas', {visas: 'unknown'});
                }
            } else if (err.status === 409 || code === 'CONCURRENT_UPDATE' || /concurrent/i.test(err.message || '')) {
                msg = t('projectForm.concurrentEditNotice') || err.message;
                refreshProjects();
            } else if (err.status === 404 || code === 'NOT_FOUND' || /not found/i.test(err.message || '')) {
                msg = t('projectList.concurrentDeleteNotice') || 'The project no longer exists. It may have been deleted by another user.';
                refreshProjects();
            } else if (code === 'VALIDATION_ERROR' && err.errors) {
                msg = Object.values(err.errors).filter(Boolean).join('; ') || err.message;
            } else {
                msg = err.message && err.message !== 'Validation failed' ? err.message : t('common.unexpectedError');
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
            <hr className="pim-divider"/>
            {errorMessage && (
                <div className="error-banner" role="alert">
                    <span>{errorMessage}</span>
                    <button type="button" className="error-banner-close" onClick={() => setErrorMessage('')}
                            title="Close">✕
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit, onFormError)} className="pim-form-body" noValidate>
                {renderTextRow('projectNumber', 'projectNumber', 'projectNumber', 4, 'input-sm', 'text', {
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
                        render={({field}) => (
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
                        render={({field}) => (
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
                    <select id="status"
                            className={`pim-select input-md ${errors.status ? 'field-error' : ''}`} {...register('status')}>
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
                            render={({field}) => (
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
                                render={({field}) => (
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

                <hr className="pim-divider" style={{marginTop: '36px'}}/>
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
