import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../common/Pagination';
import ConfirmModal from '../common/ConfirmModal';
import LocaleDatePicker from '../common/LocaleDatePicker';
import MemberSuggest from './MemberSuggest';
import { useLanguage } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';

// 1. Format date string: YYYY-MM-DD -> DD.MM.YYYY
const fmtDate = (d) => (d ? String(d).split('-').reverse().join('.') : '');

// 2. Table column definitions: [className, translationKey, sortField]
const COLS = [
  ['col-checkbox'],
  ['col-number', 'number', 'projectNumber'],
  ['col-name', 'name', 'name'],
  ['col-status', 'status', 'status'],
  ['col-customer', 'customer', 'customer'],
  ['col-date', 'startDate', 'startDate'],
  ['col-delete', 'delete'],
];

// 3. Dynamic configuration for Advanced Filter fields
const ADV_FIELDS = [
  { label: 'leaderPlaceholder', key: 'leaderVisa', isSelect: true },
  { label: 'memberPlaceholder', key: 'memberVisas', isMemberSuggest: true },
  { label: 'startDateFrom', key: 'startDateFrom', isDate: true },
  { label: 'startDateTo', key: 'startDateTo', isDate: true },
  { label: 'endDateFrom', key: 'endDateFrom', isDate: true },
  { label: 'endDateTo', key: 'endDateTo', isDate: true },
];

const ADV_KEYS = ADV_FIELDS.map((f) => f.key);

export default function ProjectList() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // ProjectContext: Data, query state, pagination, sorting & CRUD actions
  const {
    projects,
    totalPages,
    searchCriteria,
    setSearchCriteria,
    resetSearch,
    sortConfig,
    toggleSort,
    currentPage,
    setCurrentPage,
    deleteProject,
    deleteProjects,
    loading,
    groups,
    loadGroups,
    employees,
  } = useProjects();

  // Priority fallback: URL query params > Context criteria > Empty string
  const urlKw = searchParams.get('keyword') || '';
  const urlSt = (searchParams.get('status') || '').toUpperCase();
  const initialSearch = urlKw || searchCriteria.keyword || '';
  const initialStatus = urlSt || searchCriteria.status || '';

  const initialAdv = Object.fromEntries(
    ADV_KEYS.map((k) => [
      k,
      searchParams.get(k) || (k === 'memberVisas' && searchParams.get('memberVisa')) || searchCriteria[k] || '',
    ])
  );

  // Local input states (unsubmitted draft values)
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [statusInput, setStatusInput] = useState(initialStatus);
  const [showAdvanced, setShowAdvanced] = useState(Object.values(initialAdv).some(Boolean));
  const [advInputs, setAdvInputs] = useState(initialAdv);

  // Selection, modal & error states
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, ids: [], message: '' });
  const [actionError, setActionError] = useState('');

  // Clear action error banner when language changes
  useEffect(() => {
    setActionError('');
  }, [language]);

  // Lazy-load groups on demand when advanced filter is opened
  useEffect(() => {
    if (showAdvanced && !groups.length) {
      loadGroups();
    }
  }, [showAdvanced, groups.length, loadGroups]);

  // Clean Params Rule (TC-ADV-04): Strip empty/null/undefined params from URL
  const updateUrlParams = (c) => {
    const params = Object.fromEntries(
      Object.entries(c).filter(([_, v]) => Boolean(v && String(v).trim()))
    );
    setSearchParams(params, { replace: false });
  };

  // Sanitize and format search criteria before submission
  const syncSearch = () => ({
    keyword: searchInput.trim(),
    status: (statusInput || '').toUpperCase(),
    ...Object.fromEntries(
      Object.entries(advInputs).map(([k, v]) => [
        k,
        k === 'memberVisas'
          ? (v || '').replace(/\s*,\s*/g, ',').toUpperCase()
          : k === 'leaderVisa'
          ? (v || '').toUpperCase()
          : (v || '').trim(),
      ])
    ),
  });

  // Two-way sync with URL searchParams (TC-NAV-01 Browser Back/Forward & Cancel draft restoration)
  useEffect(() => {
    const hasUrlParams = Boolean(
      searchParams.get('keyword') ||
      searchParams.get('status') ||
      ADV_KEYS.some((k) => searchParams.get(k))
    );

    const hasContextCriteria = Boolean(
      searchCriteria.keyword ||
      searchCriteria.status ||
      ADV_KEYS.some((k) => searchCriteria[k])
    );

    // Case 1: Returning to / with no URL params but search was active (e.g. Cancel button) -> restore criteria
    if (!hasUrlParams && hasContextCriteria) {
      const restoredKw = searchCriteria.keyword || '';
      const restoredSt = searchCriteria.status || '';
      const restoredAdv = Object.fromEntries(
        ADV_KEYS.map((k) => [k, searchCriteria[k] || ''])
      );
      setSearchInput(restoredKw);
      setStatusInput(restoredSt);
      setAdvInputs(restoredAdv);
      if (Object.values(restoredAdv).some(Boolean)) {
        setShowAdvanced(true);
      }
      updateUrlParams({ keyword: restoredKw, status: restoredSt, ...restoredAdv });
      return;
    }

    // Case 2: Sync URL params into local inputs
    const kw = searchParams.get('keyword') || '';
    const st = (searchParams.get('status') || '').toUpperCase();
    const currentAdv = Object.fromEntries(
      ADV_KEYS.map((k) => [k, searchParams.get(k) || (k === 'memberVisas' && searchParams.get('memberVisa')) || ''])
    );

    setSearchInput(kw);
    setStatusInput(st);
    setAdvInputs(currentAdv);
    if (Object.values(currentAdv).some(Boolean)) {
      setShowAdvanced(true);
    }

    // Only update context criteria if parameters actually changed (prevents re-render loops)
    const isDifferent =
      kw.trim() !== (searchCriteria.keyword || '').trim() ||
      st !== (searchCriteria.status || '') ||
      ADV_KEYS.some((k) => currentAdv[k] !== (searchCriteria[k] || ''));

    if (isDifferent) {
      setSearchCriteria({
        keyword: kw.trim(),
        status: st,
        ...currentAdv,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update a single advanced filter field
  const handleAdvChange = (f, v) => setAdvInputs((prev) => ({ ...prev, [f]: v }));

  // Execute search: sanitize data, trigger API, reset to page 1, sync URL
  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActionError('');
    const next = syncSearch();
    setSearchCriteria(next);
    setCurrentPage(1);
    updateUrlParams(next);
    setSelectedIds([]);
  };

  // Reset search: clear inputs, reset context, clear URL params
  const handleReset = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSearchInput('');
    setStatusInput('');
    setAdvInputs(Object.fromEntries(ADV_KEYS.map((k) => [k, ''])));
    setActionError('');
    resetSearch();
    setSearchParams({}, { replace: true });
    setSelectedIds([]);
  };

  // Toggle selection for a project row
  const toggleSelectRow = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Validate delete target (Only projects with status NEW can be deleted)
  const openDelete = (targets, msg) => {
    setActionError('');
    if (targets.some((p) => (p.status || '').toUpperCase() !== 'NEW')) {
      return setActionError(t('projectList.statusOnlyNewDelete'));
    }
    setModalConfig({ isOpen: true, ids: targets.map((p) => p.id || p.projectNumber), message: msg });
  };

  // Confirm delete: execute API call for single or multiple projects
  const confirmDelete = async () => {
    try {
      await (modalConfig.ids.length === 1
        ? deleteProject(modalConfig.ids[0])
        : deleteProjects(modalConfig.ids));
      setSelectedIds((prev) => prev.filter((id) => !modalConfig.ids.includes(id)));
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete');
    } finally {
      setModalConfig({ isOpen: false, ids: [], message: '' });
    }
  };

  // Render sorting direction caret
  const renderSortIcon = (f) =>
    sortConfig?.field === f ? (
      <span className="sort-caret">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
    ) : null;

  return (
    <div className="pim-project-list-container">
      {/* 1. Page Title */}
      <h2 className="pim-page-title">{t('projectList.title')}</h2>
      <hr className="pim-divider" />

      {/* 2. Action Error Banner */}
      {actionError && (
        <div className="error-banner" role="alert">
          <i className="fa fa-exclamation-circle" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 3. Basic Search Bar */}
      <form className="pim-search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          className="pim-input search-input-field"
          placeholder={t('projectList.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="pim-select search-select-field"
          value={statusInput}
          onChange={(e) => setStatusInput((e.target.value || '').toUpperCase())}
        >
          <option value="">{t('projectList.statusPlaceholder')}</option>
          {['NEW', 'PLA', 'INP', 'FIN'].map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-pim-primary">
          {t('projectList.searchBtn')}
        </button>
        <button type="button" className="btn-reset-search" onClick={handleReset}>
          {t('projectList.resetSearch')}
        </button>
        <button
          type="button"
          className="btn-advanced-toggle"
          onClick={() => setShowAdvanced((p) => !p)}
          title={showAdvanced ? t('projectList.hideAdvanced') : t('projectList.showAdvanced')}
          aria-label={showAdvanced ? t('projectList.hideAdvanced') : t('projectList.showAdvanced')}
        >
          <i className="fa fa-filter" />
        </button>
      </form>

      {/* 4. Advanced Filter Panel (collapsible) */}
      {showAdvanced && (
        <div className="advanced-filter-panel">
          <div className="advanced-filter-grid">
            {ADV_FIELDS.map(({ label, key, isDate, isSelect, isMemberSuggest }) => (
              <div key={key} className="advanced-filter-item">
                <label className="advanced-filter-label" htmlFor={key}>
                  {t(`projectList.${label}`)}
                </label>
                {isDate ? (
                  <LocaleDatePicker
                    id={key}
                    value={advInputs[key]}
                    onChange={(val) => handleAdvChange(key, val)}
                  />
                ) : isSelect ? (
                  <select
                    id={key}
                    className="pim-select input-md"
                    value={advInputs[key]}
                    onChange={(e) => handleAdvChange(key, e.target.value)}
                  >
                    <option value="">{t('projectList.selectGroup')}</option>
                    {(groups || []).map((g) => {
                      const visa = g.groupLeader?.visa || g.leaderVisa;
                      return visa ? (
                        <option key={g.id} value={visa}>
                          {visa}
                        </option>
                      ) : null;
                    })}
                  </select>
                ) : isMemberSuggest ? (
                  <MemberSuggest
                    value={advInputs[key]}
                    onChange={(v) => handleAdvChange(key, v)}
                    employees={employees}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Projects Data Table */}
      <div className="pim-table-wrapper">
        <table className="pim-table">
          <thead>
            <tr>
              {COLS.map(([cls, key, sortField]) => (
                <th
                  key={cls}
                  className={`${cls} ${sortField ? 'sortable-th' : ''}`}
                  onClick={sortField ? () => toggleSort(sortField) : undefined}
                >
                  {key ? t(`projectList.table.${key}`) : null}
                  {sortField && renderSortIcon(sortField)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!projects.length ? (
              <tr>
                <td colSpan={7} className="empty-table-msg">
                  {loading ? t('common.loading') : t('projectList.noProjectsFound')}
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const id = p.id || p.projectNumber;
                return (
                  <tr key={p.projectNumber} className={selectedIds.includes(id) ? 'selected-row' : ''}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        className="pim-checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleSelectRow(id)}
                        aria-label={`Select project ${p.projectNumber}`}
                      />
                    </td>
                    <td className="col-number">
                      <Link to={`/project/edit/${p.id || p.projectNumber}`} className="project-number-link">
                        {p.projectNumber}
                      </Link>
                    </td>
                    <td className="col-name">{p.name}</td>
                    <td className="col-status">{t(`status.${p.status}`)}</td>
                    <td className="col-customer">{p.customer}</td>
                    <td className="col-date">{fmtDate(p.startDate)}</td>
                    <td className="col-delete">
                      {p.status === 'NEW' && (
                        <button
                          type="button"
                          className="btn-delete-icon"
                          onClick={() =>
                            openDelete(
                              [p],
                              t('projectList.confirmDeleteSingle', { number: p.projectNumber })
                            )
                          }
                          title="Delete project"
                          aria-label={`Delete project ${p.projectNumber}`}
                        >
                          <i className="fa fa-trash-o" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 6. Multi-select Action Bar */}
      {selectedIds.length > 0 && (
        <div className="table-selection-bar">
          <span className="selected-count-text">
            {t('projectList.selectedItems', { count: selectedIds.length })}
          </span>
          <button
            type="button"
            className="btn-delete-selected"
            onClick={() =>
              openDelete(
                projects.filter((p) => selectedIds.includes(p.id || p.projectNumber)),
                t('projectList.confirmDeleteMultiple', { count: selectedIds.length })
              )
            }
          >
            <span>{t('projectList.deleteSelected')}</span>
            <i className="fa fa-trash-o" />
          </button>
        </div>
      )}

      {/* 7. Pagination */}
      <div className="pim-pagination-container">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* 8. Confirm Delete Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={t('common.confirm')}
        message={modalConfig.message}
        onConfirm={confirmDelete}
        onCancel={() => setModalConfig({ isOpen: false, ids: [], message: '' })}
      />
    </div>
  );
}
