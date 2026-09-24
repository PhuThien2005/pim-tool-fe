import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProjects } from '../context/ProjectContext';

export const fmtDate = (d) => (d ? String(d).split('-').reverse().join('.') : '');

export function useProjectList() {
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
    setAdvInputs({ leaderVisa: '', memberVisa: '', startDateFrom: '', startDateTo: '', endDateFrom: '', endDateTo: '' });
    setActionError('');
    resetSearch();
    setSearchParams({}, { replace: true });
    setSelectedIds([]);
  };

  const pageIds = projects.map((p) => p.id || p.projectNumber);
  const isAllPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const toggleSelectRow = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = () => setSelectedIds((prev) => (isAllPageSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]));

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

  return {
    t, projects, groups, employees, totalPages, currentPage, setCurrentPage, loading,
    searchInput, setSearchInput, statusInput, setStatusInput, showAdvanced, setShowAdvanced,
    advInputs, handleAdvChange, selectedIds, modalConfig, setModalConfig, actionError,
    handleSearch, handleReset, isAllPageSelected, toggleSelectRow, toggleSelectAll,
    openDelete, confirmDelete, toggleSort, renderSortIcon, fmtDate,
  };
}

export default useProjectList;
