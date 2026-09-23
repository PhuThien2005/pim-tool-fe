import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

export const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProjectProviderInner({ children }) {
  const queryClient = useQueryClient();
  const [searchCriteria, setSearchCriteriaState] = useState(initialCriteria);
  const [sortConfig, setSortConfig] = useState({ field: 'projectNumber', direction: 'asc' });
  const [currentPage, setCurrentPageState] = useState(1);
  const [groups, setGroups] = useState(() => projectService.getGroups());
  const [employees] = useState(() => projectService.getEmployees());

  const getLatestProjects = (criteria = searchCriteria, page = currentPage, sort = sortConfig) => {
    const pageIndex = Math.max(0, page - 1);
    const sortParam = `${sort.field},${sort.direction}`;
    return projectService.searchProjects(criteria, {
      page: pageIndex,
      size: 5,
      sort: sortParam,
    });
  };

  const [localPageResult, setLocalPageResult] = useState(() => getLatestProjects());

  // TanStack Query for searching projects
  const { data: queryPageResult, isLoading: loading } = useQuery({
    queryKey: ['projects', searchCriteria, currentPage, sortConfig],
    queryFn: async () => {
      const pageIndex = Math.max(0, currentPage - 1);
      const sortParam = `${sortConfig.field},${sortConfig.direction}`;
      const localRes = projectService.searchProjects(searchCriteria, {
        page: pageIndex,
        size: 5,
        sort: sortParam,
      });
      if (process.env.NODE_ENV !== 'test') {
        try {
          const apiRes = await projectService.searchProjectsApi(searchCriteria, {
            page: pageIndex,
            size: 5,
            sort: sortParam,
          });
          if (apiRes && Array.isArray(apiRes.content)) return apiRes;
        } catch {
          // fallback to local data
        }
      }
      return localRes;
    },
    onSuccess: (data) => {
      setLocalPageResult(data);
    },
  });

  const pageResult = queryPageResult || localPageResult;

  const groupsLoadedRef = useRef(false);
  const loadGroups = useCallback(async () => {
    if (groupsLoadedRef.current || process.env.NODE_ENV === 'test') return;
    groupsLoadedRef.current = true;
    try {
      const slice = await projectService.getGroupsApi({ page: 0, size: 20, sort: 'id,asc' });
      if (slice && Array.isArray(slice.content) && slice.content.length) {
        setGroups(slice.content);
      }
    } catch {}
  }, []);

  const setSearchCriteria = (newCriteria) => {
    const updated = { ...searchCriteria, ...newCriteria };
    setSearchCriteriaState(updated);
    setCurrentPageState(1);
    const nextData = getLatestProjects(updated, 1, sortConfig);
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', updated, 1, sortConfig], nextData);
  };

  const resetSearch = () => {
    setSearchCriteriaState(initialCriteria);
    setCurrentPageState(1);
    const nextData = getLatestProjects(initialCriteria, 1, sortConfig);
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', initialCriteria, 1, sortConfig], nextData);
  };

  const setCurrentPage = (page) => {
    setCurrentPageState(page);
    const nextData = getLatestProjects(searchCriteria, page, sortConfig);
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', searchCriteria, page, sortConfig], nextData);
  };

  const toggleSort = (field) => {
    const nextDir = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const nextSort = { field, direction: nextDir };
    setSortConfig(nextSort);
    const nextData = getLatestProjects(searchCriteria, currentPage, nextSort);
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', searchCriteria, currentPage, nextSort], nextData);
  };

  const createProject = (data) => {
    const created = projectService.createProject(data);
    const nextData = getLatestProjects();
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', searchCriteria, currentPage, sortConfig], nextData);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    return created;
  };

  const updateProject = (projectNumber, data) => {
    const updated = projectService.updateProject(projectNumber, data);
    const nextData = getLatestProjects();
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', searchCriteria, currentPage, sortConfig], nextData);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    return updated;
  };

  const deleteProject = (idOrNumber) => {
    projectService.deleteProject(idOrNumber);
    const nextData = getLatestProjects();
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', searchCriteria, currentPage, sortConfig], nextData);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const deleteProjects = (idsOrNumbers) => {
    projectService.deleteProjects(idsOrNumbers);
    const nextData = getLatestProjects();
    setLocalPageResult(nextData);
    queryClient.setQueryData(['projects', searchCriteria, currentPage, sortConfig], nextData);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
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
        loading,
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
        refreshProjects: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const ProjectProvider = ({ children }) => {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <ProjectProviderInner>{children}</ProjectProviderInner>
    </QueryClientProvider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};

export default ProjectContext;
