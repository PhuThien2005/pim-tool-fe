import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { projectService } from '../services/projectService';

const ProjectContext = createContext();

const initialCriteria = {
  searchTerm: '',
  status: '',
  leaderVisa: '',
  memberVisa: '',
  startDateFrom: '',
  startDateTo: '',
  endDateFrom: '',
  endDateTo: '',
};

export const ProjectProvider = ({ children }) => {
  const [searchCriteria, setSearchCriteriaState] = useState(initialCriteria);
  const [sortConfig, setSortConfig] = useState({ field: 'projectNumber', direction: 'asc' });
  const [currentPage, setCurrentPageState] = useState(1);
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]);

  const refreshList = useCallback(async (criteria = searchCriteria, page = currentPage, sort = sortConfig) => {
    const localRes = projectService.searchProjects(criteria, {
      page: Math.max(0, page - 1),
      size: 5,
      sort: `${sort.field},${sort.direction}`,
    });
    setPageResult(localRes);

    if (process.env.NODE_ENV !== 'test') {
      try {
        const apiRes = await projectService.searchProjectsApi(criteria, {
          page: Math.max(0, page - 1),
          size: 5,
          sort: `${sort.field},${sort.direction}`,
        });
        if (apiRes && Array.isArray(apiRes.content)) {
          setPageResult(apiRes);
        }
      } catch {
        // Fallback to local data if backend is unreachable
      }
    }
  }, [searchCriteria, currentPage, sortConfig]);

  const [pageResult, setPageResult] = useState(() => {
    return projectService.searchProjects(initialCriteria, { page: 0, size: 5, sort: 'projectNumber,asc' });
  });

  const groupsLoadedRef = useRef(false);
  const loadGroups = useCallback(async () => {
    if (groupsLoadedRef.current || process.env.NODE_ENV === 'test') return;
    groupsLoadedRef.current = true;
    try {
      const slice = await projectService.getGroupsApi({ page: 0, size: 20, sort: 'id,asc' });
      if (slice && Array.isArray(slice.content) && slice.content.length) {
        setGroups(slice.content);
      }
    } catch {
      // Keep local groups fallback
    }
  }, []);

  useEffect(() => {
    try {
      setGroups(projectService.getGroups());
      setEmployees(projectService.getEmployees());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      refreshList(initialCriteria, 1, sortConfig);
    }
  }, [refreshList, sortConfig]);

  const setSearchCriteria = (newCriteria) => {
    const updated = { ...searchCriteria, ...newCriteria };
    setSearchCriteriaState(updated);
    setCurrentPageState(1);
    refreshList(updated, 1, sortConfig);
  };

  const resetSearch = () => {
    setSearchCriteriaState(initialCriteria);
    setCurrentPageState(1);
    refreshList(initialCriteria, 1, sortConfig);
  };

  const setCurrentPage = (page) => {
    setCurrentPageState(page);
    refreshList(searchCriteria, page, sortConfig);
  };

  const toggleSort = (field) => {
    const nextDir = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const nextSort = { field, direction: nextDir };
    setSortConfig(nextSort);
    refreshList(searchCriteria, currentPage, nextSort);
  };

  const createProject = (data) => {
    const created = projectService.createProject(data);
    refreshList(searchCriteria, currentPage, sortConfig);
    return created;
  };

  const updateProject = (projectNumber, data) => {
    const updated = projectService.updateProject(projectNumber, data);
    refreshList(searchCriteria, currentPage, sortConfig);
    return updated;
  };

  const deleteProject = (idOrNumber) => {
    projectService.deleteProject(idOrNumber);
    refreshList(searchCriteria, currentPage, sortConfig);
  };

  const deleteProjects = (idsOrNumbers) => {
    projectService.deleteProjects(idsOrNumbers);
    refreshList(searchCriteria, currentPage, sortConfig);
  };

  const getProjectByNumber = (number) => {
    const fromPage = (pageResult.content || []).find(
      (p) => p.projectNumber === +number || p.id === +number
    );
    if (fromPage) return fromPage;
    return projectService.getProjectByNumber(number) || projectService.getProjectById(number);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects: pageResult.content || [],
        totalPages: pageResult.totalPages || 1,
        totalElements: pageResult.totalElements || 0,
        groups,
        loadGroups,
        employees,
        searchCriteria,
        setSearchCriteria,
        resetSearch,
        sortConfig,
        toggleSort,
        currentPage,
        setCurrentPage,
        createProject,
        updateProject,
        deleteProject,
        deleteProjects,
        getProjectByNumber,
        refreshProjects: () => refreshList(searchCriteria, currentPage, sortConfig),
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};

export default ProjectContext;
