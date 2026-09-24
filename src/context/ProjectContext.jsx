import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectService } from '../services/projectService';

const ProjectContext = createContext();

const initialCriteria = {
  searchTerm: '', status: '', leaderVisa: '', memberVisa: '',
  startDateFrom: '', startDateTo: '', endDateFrom: '', endDateTo: '',
};

const EMPTY_PAGE = { content: [], totalPages: 1, totalElements: 0 };

export const defaultQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function ProjectProviderInner({ children }) {
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCriteriaFromUrl = {
    searchTerm: searchParams.get('keyword') || searchParams.get('searchTerm') || searchParams.get('search') || '',
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

  // useQuery is the SOLE data source for projects — no more localResult
  const { data: pageResult = EMPTY_PAGE, isLoading: loading } = useQuery({
    queryKey: ['projects', searchCriteria, currentPage, sortConfig],
    queryFn: async () => {
      const pageIndex = Math.max(0, currentPage - 1);
      const sort = `${sortConfig.field},${sortConfig.direction}`;
      return projectService.searchProjects(searchCriteria, { page: pageIndex, size: 5, sort });
    },
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

  // Lazy load employees — only called when member suggest needs it
  const loadEmployees = useCallback(async () => {
    if (employees.length) return; // already loaded
    try {
      const result = await projectService.getEmployees({ page: 0, size: 50, sort: 'visa,asc' });
      const list = Array.isArray(result) ? result : result?.content || [];
      if (list.length) setEmployees(list);
    } catch { /* silent */ }
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
        setSearchCriteria: (c) => { const next = { ...searchCriteria, ...c }; setSearchCriteriaState(next); setCurrentPage(1); },
        resetSearch: () => { setSearchCriteriaState(initialCriteria); setCurrentPage(1); },
        setCurrentPage,
        toggleSort: (field) => {
          setSortConfig((prev) => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
          }));
        },
        createProject, updateProject, deleteProject, deleteProjects,
        getProjectByNumber, refreshProjects,
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
