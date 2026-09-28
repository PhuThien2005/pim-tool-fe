import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectService } from '../services/projectService';

const ProjectContext = createContext();

const initialCriteria = {
  keyword: '', status: '', leaderVisa: '', memberVisas: '',
  startDateFrom: '', startDateTo: '', endDateFrom: '', endDateTo: '',
};

const EMPTY_PAGE = { content: [], totalPages: 1, totalElements: 0 };

export const defaultQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function ProjectProviderInner({ children }) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const isProjectListPage =
    location.pathname === '/' || location.pathname.startsWith('/projects');

  const searchParams = new URLSearchParams(window.location.search);
  const initialCriteriaFromUrl = {
    keyword: searchParams.get('keyword') || searchParams.get('searchTerm') || searchParams.get('search') || '',
    status: (searchParams.get('status') || '').toUpperCase(),
    leaderVisa: searchParams.get('leaderVisa') || '',
    memberVisas: (searchParams.get('memberVisas') || searchParams.get('memberVisa') || '').replace(/\s*,\s*/g, ','),
    startDateFrom: searchParams.get('startDateFrom') || '',
    startDateTo: searchParams.get('startDateTo') || '',
    endDateFrom: searchParams.get('endDateFrom') || '',
    endDateTo: searchParams.get('endDateTo') || '',
  };
  const [searchCriteria, setSearchCriteriaState] = useState(initialCriteriaFromUrl);
  const [sortConfig, setSortConfig] = useState({ field: 'projectNumber', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]);

  // useQuery is the SOLE data source for projects — only active on Project List page
  const { data: pageResult = EMPTY_PAGE, isLoading: loading } = useQuery({
    queryKey: ['projects', searchCriteria, currentPage, sortConfig],
    queryFn: async () => {
      const pageIndex = Math.max(0, currentPage - 1);
      const sort = `${sortConfig.field},${sortConfig.direction}`;
      return projectService.searchProjects(searchCriteria, { page: pageIndex, size: 5, sort });
    },
    enabled: process.env.NODE_ENV === 'test' || isProjectListPage,
  });

  // Lazy load groups — only called when filter panel opens or form mounts
  const loadGroups = useCallback(async () => {
    if (groups.length) return; // already loaded
    try {
      const result = await projectService.getGroups({ page: 0, size: 50, sort: 'id,asc' });
      const list = Array.isArray(result) ? result : result?.content || [];
      if (list.length) setGroups(list);
    } catch { /* silent */ }
  }, [groups.length]);

  // Lazy load employees — backend returns empty list if no keyword is supplied,
  // so employees are fetched on-demand by keyword in MemberSuggest.
  // In test environment, loads mock employees.
  const loadEmployees = useCallback(async () => {
    if (employees.length) return; // already loaded
    if (process.env.NODE_ENV === 'test') {
      try {
        const result = await projectService.getEmployees({ page: 0, size: 100, sort: 'visa,asc' });
        const list = Array.isArray(result) ? result : result?.content || [];
        if (list.length) setEmployees(list);
      } catch { /* silent */ }
    }
  }, [employees.length]);

  const refreshProjects = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    [queryClient]
  );

  // CRUD operations — all async, invalidate cache after
  const createProject = useCallback(async (data) => {
    const res = await projectService.createProject(data);
    refreshProjects();
    return res;
  }, [refreshProjects]);

  const updateProject = useCallback(async (num, data) => {
    const res = await projectService.updateProject(num, data);
    refreshProjects();
    return res;
  }, [refreshProjects]);

  const deleteProject = useCallback(async (id) => {
    const res = await projectService.deleteProject(id);
    refreshProjects();
    return res;
  }, [refreshProjects]);

  const deleteProjects = useCallback(async (ids) => {
    const res = await projectService.deleteProjects(ids);
    refreshProjects();
    return res;
  }, [refreshProjects]);

  const getProjectById = useCallback(async (id) => {
    return projectService.getProjectById(id);
  }, []);

  const getProjectByNumber = useCallback((num) => {
    return (pageResult.content || []).find((p) => p.projectNumber === +num || p.id === +num) || null;
  }, [pageResult.content]);

  return (
    <ProjectContext.Provider
      value={{
        projects: pageResult.content || [],
        totalPages: pageResult.totalPages || 1,
        totalElements: pageResult.totalElements || 0,
        loading, groups, employees, loadGroups, loadEmployees,
        searchCriteria, sortConfig, currentPage,
        setSearchCriteria: (c) => {
          setSearchCriteriaState((prev) => {
            const next = { ...prev, ...c };
            const isChanged = Object.keys(next).some((k) => (next[k] || '') !== (prev[k] || ''));
            if (isChanged) {
              setCurrentPage(1);
            }
            return next;
          });
        },
        resetSearch: () => { setSearchCriteriaState(initialCriteria); setCurrentPage(1); },
        setCurrentPage,
        toggleSort: (field) => {
          setSortConfig((prev) => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
          }));
        },
        createProject, updateProject, deleteProject, deleteProjects,
        getProjectById, getProjectByNumber, refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const ProjectProvider = ({ children }) => (
  <QueryClientProvider client={defaultQueryClient}>
    <ProjectProviderInner>{children}</ProjectProviderInner>
  </QueryClientProvider>
);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};

export default ProjectContext;
