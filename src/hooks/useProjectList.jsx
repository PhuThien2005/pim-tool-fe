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
    deleteProjects, loading, groups, loadGroups,
  } = useProjects();

  const urlKeyword = searchParams.get('keyword') || searchParams.get('searchTerm') || searchParams.get('search') || '';
  const urlStatus = (searchParams.get('status') || '').toUpperCase();
  const urlLeader = searchParams.get('leaderVisa') || '';
  const urlMember = searchParams.get('memberVisa') || '';
  const urlStartFrom = searchParams.get('startDateFrom') || '';
  const urlStartTo = searchParams.get('startDateTo') || '';
  const urlEndFrom = searchParams.get('endDateFrom') || '';
  const urlEndTo = searchParams.get('endDateTo') || '';

  const initialSearch = urlKeyword || searchCriteria.searchTerm || '';
  const initialStatus = urlStatus || searchCriteria.status || '';
  const initialAdv = {
    leaderVisa: urlLeader || searchCriteria.leaderVisa || '',
    memberVisa: urlMember || searchCriteria.memberVisa || '',
    startDateFrom: urlStartFrom || searchCriteria.startDateFrom || '',
    startDateTo: urlStartTo || searchCriteria.startDateTo || '',
    endDateFrom: urlEndFrom || searchCriteria.endDateFrom || '',
    endDateTo: urlEndTo || searchCriteria.endDateTo || '',
  };

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [statusInput, setStatusInput] = useState(initialStatus);
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initialAdv.leaderVisa || initialAdv.memberVisa || initialAdv.startDateFrom || initialAdv.startDateTo || initialAdv.endDateFrom || initialAdv.endDateTo)
  );
  const [advInputs, setAdvInputs] = useState(initialAdv);

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, ids: [], message: '' });
  const [actionError, setActionError] = useState('');
  const isInitialMount = useRef(true);
  const debounceTimer = useRef();

  useEffect(() => {
    if (urlKeyword || urlStatus || urlLeader || urlMember || urlStartFrom || urlStartTo || urlEndFrom || urlEndTo) {
      setSearchCriteria({
        searchTerm: urlKeyword, status: urlStatus, leaderVisa: urlLeader,
        memberVisa: urlMember, startDateFrom: urlStartFrom, startDateTo: urlStartTo,
        endDateFrom: urlEndFrom, endDateTo: urlEndTo,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showAdvanced && !groups.length) loadGroups();
  }, [showAdvanced, groups.length, loadGroups]);

  const updateUrlParams = (c) => {
    const params = {};
    if (c.searchTerm) params.searchTerm = c.searchTerm;
    if (c.status) params.status = c.status;
    if (c.leaderVisa) params.leaderVisa = c.leaderVisa;
    if (c.memberVisa) params.memberVisa = c.memberVisa;
    if (c.startDateFrom) params.startDateFrom = c.startDateFrom;
    if (c.startDateTo) params.startDateTo = c.startDateTo;
    if (c.endDateFrom) params.endDateFrom = c.endDateFrom;
    if (c.endDateTo) params.endDateTo = c.endDateTo;
    setSearchParams(params, { replace: true });
  };

  const syncSearch = () => ({
    searchTerm: searchInput, status: (statusInput || '').toUpperCase(),
    leaderVisa: (advInputs.leaderVisa || '').toUpperCase(), memberVisa: (advInputs.memberVisa || '').toUpperCase(),
    startDateFrom: advInputs.startDateFrom, startDateTo: advInputs.startDateTo,
    endDateFrom: advInputs.endDateFrom, endDateTo: advInputs.endDateTo,
  });

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
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
    if (targets.some((p) => p.status !== 'NEW')) return setActionError(t('projectList.statusOnlyNewDelete'));
    setModalConfig({ isOpen: true, ids: targets.map((p) => p.id || p.projectNumber), message: msg });
  };

  const confirmDelete = async () => {
    try {
      await (modalConfig.ids.length === 1 ? deleteProject(modalConfig.ids[0]) : deleteProjects(modalConfig.ids));
      setSelectedIds((prev) => prev.filter((id) => !modalConfig.ids.includes(id)));
    } catch (err) {
      setActionError(err.message || 'Failed to delete');
    } finally {
      setModalConfig({ isOpen: false, ids: [], message: '' });
    }
  };

  const renderSortIcon = (f) => (sortConfig?.field === f ? <span className="sort-caret">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span> : null);

  return {
    t, projects, groups, totalPages, currentPage, setCurrentPage, loading,
    searchInput, setSearchInput, statusInput, setStatusInput, showAdvanced, setShowAdvanced,
    advInputs, handleAdvChange, selectedIds, modalConfig, setModalConfig, actionError,
    handleSearch, handleReset, isAllPageSelected, toggleSelectRow, toggleSelectAll,
    openDelete, confirmDelete, toggleSort, renderSortIcon, fmtDate,
  };
}

export default useProjectList;
