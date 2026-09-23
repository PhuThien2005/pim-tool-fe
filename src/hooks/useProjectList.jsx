import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProjects } from '../context/ProjectContext';

export const fmtDate = (d) => (d ? String(d).split('-').reverse().join('.') : '');

export function useProjectList() {
  const { t } = useLanguage();
  const {
    projects, totalPages, searchCriteria, setSearchCriteria, resetSearch,
    sortConfig, toggleSort, currentPage, setCurrentPage, deleteProject,
    deleteProjects, loading, groups, loadGroups,
  } = useProjects();

  const [searchInput, setSearchInput] = useState(searchCriteria.searchTerm || '');
  const [statusInput, setStatusInput] = useState(searchCriteria.status || '');
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(searchCriteria.leaderVisa || searchCriteria.memberVisa || searchCriteria.startDateFrom || searchCriteria.startDateTo || searchCriteria.endDateFrom || searchCriteria.endDateTo)
  );
  const [advInputs, setAdvInputs] = useState({
    leaderVisa: searchCriteria.leaderVisa || '', memberVisa: searchCriteria.memberVisa || '',
    startDateFrom: searchCriteria.startDateFrom || '', startDateTo: searchCriteria.startDateTo || '',
    endDateFrom: searchCriteria.endDateFrom || '', endDateTo: searchCriteria.endDateTo || '',
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, ids: [], message: '' });
  const [actionError, setActionError] = useState('');
  const isInitialMount = useRef(true);
  const debounceTimer = useRef();

  useEffect(() => {
    if (showAdvanced && !groups.length) loadGroups();
  }, [showAdvanced, groups.length, loadGroups]);

  const syncSearch = () => ({
    searchTerm: searchInput, status: (statusInput || '').toUpperCase(),
    leaderVisa: (advInputs.leaderVisa || '').toUpperCase(), memberVisa: (advInputs.memberVisa || '').toUpperCase(),
    startDateFrom: advInputs.startDateFrom, startDateTo: advInputs.startDateTo,
    endDateFrom: advInputs.endDateFrom, endDateTo: advInputs.endDateTo,
  });

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setSearchCriteria(syncSearch()), 350);
    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, statusInput, advInputs]);

  const handleAdvChange = (f, v) => setAdvInputs((prev) => ({ ...prev, [f]: v }));

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    clearTimeout(debounceTimer.current);
    setActionError('');
    setSearchCriteria(syncSearch());
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
