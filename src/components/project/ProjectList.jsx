import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../common/Pagination';
import ConfirmModal from '../common/ConfirmModal';
import LocaleDatePicker from '../common/LocaleDatePicker';
import MemberSuggest from './MemberSuggest';
import { useLanguage } from '../../context/LanguageContext';
import { useProjects } from '../../context/ProjectContext';

const fmtDate = (d) => (d ? String(d).split('-').reverse().join('.') : '');

const COLS = [
  ['col-checkbox'], ['col-number', 'number', 'projectNumber'], ['col-name', 'name', 'name'],
  ['col-status', 'status', 'status'], ['col-customer', 'customer', 'customer'],
  ['col-date', 'startDate', 'startDate'], ['col-delete', 'delete'],
];

const ADV_FIELDS = [
  { label: 'leaderPlaceholder', key: 'leaderVisa', isSelect: true },
  { label: 'memberPlaceholder', key: 'memberVisas', isMemberSuggest: true },
  { label: 'startDateFrom', key: 'startDateFrom', isDate: true },
  { label: 'startDateTo', key: 'startDateTo', isDate: true },
  { label: 'endDateFrom', key: 'endDateFrom', isDate: true },
  { label: 'endDateTo', key: 'endDateTo', isDate: true },
];

export default function ProjectList() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    projects, totalPages, searchCriteria, setSearchCriteria, resetSearch,
    sortConfig, toggleSort, currentPage, setCurrentPage, deleteProject,
    deleteProjects, loading, groups, loadGroups, employees, loadEmployees
  } = useProjects();

  const urlKeyword = searchParams.get('keyword') || searchParams.get('searchTerm') || searchParams.get('search') || '';
  const urlStatus = (searchParams.get('status') || '').toUpperCase();
  const urlLeader = searchParams.get('leaderVisa') || '';
  const urlMember = searchParams.get('memberVisas') || searchParams.get('memberVisa') || '';
  const urlStartFrom = searchParams.get('startDateFrom') || '';
  const urlStartTo = searchParams.get('startDateTo') || '';
  const urlEndFrom = searchParams.get('endDateFrom') || '';
  const urlEndTo = searchParams.get('endDateTo') || '';

  const initialSearch = urlKeyword || searchCriteria.searchTerm || '';
  const initialStatus = urlStatus || searchCriteria.status || '';
  const initialAdv = {
    leaderVisa: urlLeader || searchCriteria.leaderVisa || '',
    memberVisas: urlMember || searchCriteria.memberVisas || '',
    startDateFrom: urlStartFrom || searchCriteria.startDateFrom || '',
    startDateTo: urlStartTo || searchCriteria.startDateTo || '',
    endDateFrom: urlEndFrom || searchCriteria.endDateFrom || '',
    endDateTo: urlEndTo || searchCriteria.endDateTo || '',
  };

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [statusInput, setStatusInput] = useState(initialStatus);
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initialAdv.leaderVisa || initialAdv.memberVisas || initialAdv.startDateFrom || initialAdv.startDateTo || initialAdv.endDateFrom || initialAdv.endDateTo)
  );
  const [advInputs, setAdvInputs] = useState(initialAdv);

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, ids: [], message: '' });
  const [actionError, setActionError] = useState('');
  const isInitialMount = useRef(true);
  const isInitialMountDebounce = useRef(true);
  const debounceTimer = useRef();

  useEffect(() => {
    if (showAdvanced) {
      if (!groups.length) loadGroups();
      if (!employees.length) loadEmployees();
    }
  }, [showAdvanced, groups.length, loadGroups, employees.length, loadEmployees]);

  const updateUrlParams = (c) => {
    const params = {};
    if (c.searchTerm) params.searchTerm = c.searchTerm;
    if (c.status) params.status = c.status;
    if (c.leaderVisa) params.leaderVisa = c.leaderVisa;
    if (c.memberVisas) params.memberVisas = c.memberVisas;
    if (c.startDateFrom) params.startDateFrom = c.startDateFrom;
    if (c.startDateTo) params.startDateTo = c.startDateTo;
    if (c.endDateFrom) params.endDateFrom = c.endDateFrom;
    if (c.endDateTo) params.endDateTo = c.endDateTo;
    setSearchParams(params, { replace: true });
  };

  const syncSearch = () => ({
    searchTerm: searchInput, status: (statusInput || '').toUpperCase(),
    leaderVisa: (advInputs.leaderVisa || '').toUpperCase(), memberVisas: (advInputs.memberVisas || '').replace(/\s*,\s*/g, ',').toUpperCase(),
    startDateFrom: advInputs.startDateFrom, startDateTo: advInputs.startDateTo,
    endDateFrom: advInputs.endDateFrom, endDateTo: advInputs.endDateTo,
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // If we came from another page (e.g. Cancel new project) and context has criteria but URL doesn't, sync URL
      const needsSync = (!urlKeyword && initialSearch) || (!urlStatus && initialStatus) ||
                        (!urlLeader && initialAdv.leaderVisa) || (!urlMember && initialAdv.memberVisas) ||
                        (!urlStartFrom && initialAdv.startDateFrom) || (!urlStartTo && initialAdv.startDateTo) ||
                        (!urlEndFrom && initialAdv.endDateFrom) || (!urlEndTo && initialAdv.endDateTo);
      if (needsSync) updateUrlParams({ searchTerm: initialSearch, status: initialStatus, ...initialAdv });
      return;
    }

    // Sync state when URL changes externally (e.g. Browser Back/Forward buttons)
    const kw = searchParams.get('searchTerm') || searchParams.get('keyword') || searchParams.get('search') || '';
    const st = (searchParams.get('status') || '').toUpperCase();
    const ld = searchParams.get('leaderVisa') || '';
    const mb = searchParams.get('memberVisas') || searchParams.get('memberVisa') || '';
    const sf = searchParams.get('startDateFrom') || '';
    const st2 = searchParams.get('startDateTo') || '';
    const ef = searchParams.get('endDateFrom') || '';
    const et = searchParams.get('endDateTo') || '';

    if (
      kw !== searchInput || st !== statusInput ||
      ld !== advInputs.leaderVisa || mb !== advInputs.memberVisas ||
      sf !== advInputs.startDateFrom || st2 !== advInputs.startDateTo ||
      ef !== advInputs.endDateFrom || et !== advInputs.endDateTo
    ) {
      setSearchInput(kw);
      setStatusInput(st);
      setAdvInputs({
        leaderVisa: ld, memberVisas: mb,
        startDateFrom: sf, startDateTo: st2,
        endDateFrom: ef, endDateTo: et,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (isInitialMountDebounce.current) { isInitialMountDebounce.current = false; return; }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const next = syncSearch();
      setSearchCriteria(next);
      updateUrlParams(next);
    }, 350);
    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, statusInput, advInputs]);

  const handleAdvChange = (f, v) => setAdvInputs((prev) => ({ ...prev, [f]: v }));

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    clearTimeout(debounceTimer.current);
    setActionError('');
    const next = syncSearch();
    setSearchCriteria(next);
    updateUrlParams(next);
    setSelectedIds([]);
  };

  const handleReset = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    clearTimeout(debounceTimer.current);
    setSearchInput('');
    setStatusInput('');
    setAdvInputs({ leaderVisa: '', memberVisas: '', startDateFrom: '', startDateTo: '', endDateFrom: '', endDateTo: '' });
    setActionError('');
    resetSearch();
    setSearchParams({}, { replace: true });
    setSelectedIds([]);
  };

  const toggleSelectRow = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const openDelete = (targets, msg) => {
    setActionError('');
    if (targets.some((p) => (p.status || '').toUpperCase() !== 'NEW')) return setActionError(t('projectList.statusOnlyNewDelete'));
    setModalConfig({ isOpen: true, ids: targets.map((p) => p.id || p.projectNumber), message: msg });
  };

  const confirmDelete = async () => {
    try {
      await (modalConfig.ids.length === 1 ? deleteProject(modalConfig.ids[0]) : deleteProjects(modalConfig.ids));
      setSelectedIds((prev) => prev.filter((id) => !modalConfig.ids.includes(id)));
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete');
    } finally {
      setModalConfig({ isOpen: false, ids: [], message: '' });
    }
  };

  const renderSortIcon = (f) => (sortConfig?.field === f ? <span className="sort-caret">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span> : null);

  return (
    <div className="pim-project-list-container">
      <h2 className="pim-page-title">{t('projectList.title')}</h2>
      <hr className="pim-divider" />

      {actionError && <div className="error-banner" role="alert"><i className="fa fa-exclamation-circle" /><span>{actionError}</span></div>}

      <form className="pim-search-bar" onSubmit={handleSearch}>
        <input type="text" className="pim-input search-input-field" placeholder={t('projectList.searchPlaceholder')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className="pim-select search-select-field" value={statusInput} onChange={(e) => setStatusInput((e.target.value || '').toUpperCase())}>
          <option value="">{t('projectList.statusPlaceholder')}</option>
          {['NEW', 'PLA', 'INP', 'FIN'].map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </select>
        <button type="submit" className="btn-pim-primary">{t('projectList.searchBtn')}</button>
        <button type="button" className="btn-reset-search" onClick={handleReset}>{t('projectList.resetSearch')}</button>
        <button type="button" className="btn-advanced-toggle" onClick={() => setShowAdvanced((p) => !p)} title={showAdvanced ? t('projectList.hideAdvanced') : t('projectList.showAdvanced')} aria-label={showAdvanced ? t('projectList.hideAdvanced') : t('projectList.showAdvanced')}>
          <i className="fa fa-filter" />
        </button>
      </form>

      {showAdvanced && (
        <div className="advanced-filter-panel">
          <div className="advanced-filter-grid">
            {ADV_FIELDS.map(({ label, key, type, placeholder, isDate, isSelect, isMemberSuggest }) => (
              <div key={key} className="advanced-filter-item">
                <label className="advanced-filter-label" htmlFor={key}>{t(`projectList.${label}`)}</label>
                {isDate ? (
                  <LocaleDatePicker id={key} value={advInputs[key]} onChange={(val) => handleAdvChange(key, val)} />
                ) : isSelect ? (
                  <select id={key} className="pim-select input-md" value={advInputs[key]} onChange={(e) => handleAdvChange(key, e.target.value)}>
                    <option value=""></option>
                    {(groups || []).map((g) => {
                      const visa = g.groupLeader?.visa || g.leaderVisa;
                      return visa ? <option key={g.id} value={visa}>{visa}</option> : null;
                    })}
                  </select>
                ) : isMemberSuggest ? (
                  <MemberSuggest value={advInputs[key]} onChange={(v) => handleAdvChange(key, v)} employees={employees} />
                ) : (
                  <input id={key} type={type} className="pim-input" placeholder={placeholder} value={advInputs[key]} onChange={(e) => handleAdvChange(key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pim-table-wrapper">
        <table className="pim-table">
          <thead>
            <tr>
              {COLS.map(([cls, key, sortField]) => (
                <th key={cls} className={`${cls} ${sortField ? 'sortable-th' : ''}`} onClick={sortField ? () => toggleSort(sortField) : undefined}>
                  {key ? t(`projectList.table.${key}`) : null}
                  {sortField && renderSortIcon(sortField)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!projects.length ? (
              <tr><td colSpan={7} className="empty-table-msg">{loading ? t('common.loading') : t('projectList.noProjectsFound')}</td></tr>
            ) : (
              projects.map((p) => {
                const id = p.id || p.projectNumber;
                return (
                  <tr key={p.projectNumber} className={selectedIds.includes(id) ? 'selected-row' : ''}>
                    <td className="col-checkbox">
                      <input type="checkbox" className="pim-checkbox" checked={selectedIds.includes(id)} onChange={() => toggleSelectRow(id)} aria-label={`Select project ${p.projectNumber}`} />
                    </td>
                    <td className="col-number"><Link to={`/project/edit/${p.projectNumber}`} className="project-number-link">{p.projectNumber}</Link></td>
                    <td className="col-name">{p.name}</td>
                    <td className="col-status">{t(`status.${p.status}`)}</td>
                    <td className="col-customer">{p.customer}</td>
                    <td className="col-date">{fmtDate(p.startDate)}</td>
                    <td className="col-delete">
                      {p.status === 'NEW' && (
                        <button type="button" className="btn-delete-icon" onClick={() => openDelete([p], t('projectList.confirmDeleteSingle', { number: p.projectNumber }))} title="Delete project" aria-label={`Delete project ${p.projectNumber}`}>
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

      {selectedIds.length > 0 && (
        <div className="table-selection-bar">
          <span className="selected-count-text">{t('projectList.selectedItems', { count: selectedIds.length })}</span>
          <button type="button" className="btn-delete-selected" onClick={() => openDelete(projects.filter((p) => selectedIds.includes(p.id || p.projectNumber)), t('projectList.confirmDeleteMultiple', { count: selectedIds.length }))}>
            <span>{t('projectList.deleteSelected')}</span><i className="fa fa-trash-o" />
          </button>
        </div>
      )}

      <div className="pim-pagination-container">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <ConfirmModal isOpen={modalConfig.isOpen} title={t('common.confirm')} message={modalConfig.message} onConfirm={confirmDelete} onCancel={() => setModalConfig({ isOpen: false, ids: [], message: '' })} />
    </div>
  );
}
