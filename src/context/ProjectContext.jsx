import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { projectService } from '../services/projectService';

const ProjectContext = createContext();

const initialCriteria = {
  searchTerm: '', status: '', leaderVisa: '', memberVisa: '',
  startDateFrom: '', startDateTo: '', endDateFrom: '', endDateTo: '',
};

export const defaultQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function ProjectProviderInner({ children }) {
  const queryClient = useQueryClient();
  const [searchCriteria, setSearchCriteriaState] = useState(initialCriteria);
  const [sortConfig, setSortConfig] = useState({ field: 'projectNumber', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [groups, setGroups] = useState(() => projectService.getGroups());
  const [employees] = useState(() => projectService.getEmployees());

  const getProjects = (c = searchCriteria, p = currentPage, s = sortConfig) =>
    projectService.searchProjects(c, { page: Math.max(0, p - 1), size: 5, sort: `${s.field},${s.direction}` });

  const [localResult, setLocalResult] = useState(() => getProjects());

  const { data: queryResult, isLoading: loading } = useQuery({
    queryKey: ['projects', searchCriteria, currentPage, sortConfig],
    queryFn: async () => {
      const pageIndex = Math.max(0, currentPage - 1);
      const sort = `${sortConfig.field},${sortConfig.direction}`;
      const local = projectService.searchProjects(searchCriteria, { page: pageIndex, size: 5, sort });
      if (process.env.NODE_ENV !== 'test') {
        try {
          const api = await projectService.searchProjectsApi(searchCriteria, { page: pageIndex, size: 5, sort });
          if (api?.content?.length) return api;
        } catch {}
      }
      return local;
    },
    onSuccess: (data) => setLocalResult(data),
  });

  const syncCache = (nextCriteria = searchCriteria, nextPage = currentPage, nextSort = sortConfig) => {
    const nextData = getProjects(nextCriteria, nextPage, nextSort);
    setLocalResult(nextData);
    queryClient.setQueryData(['projects', nextCriteria, nextPage, nextSort], nextData);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const loadGroups = useCallback(async () => {
    if (process.env.NODE_ENV === 'test') return;
    try {
      const slice = await projectService.getGroupsApi({ page: 0, size: 20, sort: 'id,asc' });
      if (slice?.content?.length) setGroups(slice.content);
    } catch {}
  }, []);

  const mutate = (action) => {
    const res = action();
    syncCache();
    return res;
  };

  const pageResult = queryResult || localResult;

  return (
    <ProjectContext.Provider
      value={{
        projects: pageResult.content || [],
        totalPages: pageResult.totalPages || 1,
        totalElements: pageResult.totalElements || 0,
        loading, groups, loadGroups, employees,
        searchCriteria, sortConfig, currentPage,
        setSearchCriteria: (c) => { const next = { ...searchCriteria, ...c }; setSearchCriteriaState(next); setCurrentPage(1); syncCache(next, 1, sortConfig); },
        resetSearch: () => { setSearchCriteriaState(initialCriteria); setCurrentPage(1); syncCache(initialCriteria, 1, sortConfig); },
        setCurrentPage: (p) => { setCurrentPage(p); syncCache(searchCriteria, p, sortConfig); },
        toggleSort: (field) => {
          const next = { field, direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc' };
          setSortConfig(next);
          syncCache(searchCriteria, currentPage, next);
        },
        createProject: (data) => mutate(() => projectService.createProject(data)),
        updateProject: (num, data) => mutate(() => projectService.updateProject(num, data)),
        deleteProject: (id) => mutate(() => projectService.deleteProject(id)),
        deleteProjects: (ids) => mutate(() => projectService.deleteProjects(ids)),
        getProjectByNumber: (num) => (pageResult.content || []).find((p) => p.projectNumber === +num || p.id === +num) || projectService.getProjectByNumber(num) || projectService.getProjectById(num),
        refreshProjects: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
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
