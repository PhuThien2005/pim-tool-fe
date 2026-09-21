import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [searchCriteria, setSearchCriteriaState] = useState({
    searchTerm: '',
    status: '',
  });
  const [currentPage, setCurrentPageState] = useState(1);
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Compute current page result
  const [pageResult, setPageResult] = useState(() => {
    return projectService.searchProjects({ searchTerm: '', status: '' }, { page: 0, size: 5 });
  });

  const refreshList = useCallback((criteria = searchCriteria, page = currentPage) => {
    const res = projectService.searchProjects(criteria, {
      page: Math.max(0, page - 1),
      size: 5,
      sort: 'projectNumber,asc',
    });
    setPageResult(res);
  }, [searchCriteria, currentPage]);

  useEffect(() => {
    try {
      setGroups(projectService.getGroups());
      setEmployees(projectService.getEmployees());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refreshList(searchCriteria, currentPage);
  }, [searchCriteria, currentPage, refreshList]);

  const setSearchCriteria = (newCriteria) => {
    const updated = {
      ...searchCriteria,
      ...newCriteria,
    };
    setSearchCriteriaState(updated);
    refreshList(updated, 1);
  };

  const resetSearch = () => {
    const emptyCriteria = {
      searchTerm: '',
      status: '',
    };
    setSearchCriteriaState(emptyCriteria);
    setCurrentPageState(1);
    refreshList(emptyCriteria, 1);
  };

  const setCurrentPage = (page) => {
    setCurrentPageState(page);
    refreshList(searchCriteria, page);
  };

  const createProject = (data) => {
    const created = projectService.createProject(data);
    refreshList(searchCriteria, currentPage);
    return created;
  };

  const updateProject = (projectNumber, data) => {
    const updated = projectService.updateProject(projectNumber, data);
    refreshList(searchCriteria, currentPage);
    return updated;
  };

  const deleteProject = (idOrNumber) => {
    projectService.deleteProject(idOrNumber);
    refreshList(searchCriteria, currentPage);
  };

  const deleteProjects = (idsOrNumbers) => {
    projectService.deleteProjects(idsOrNumbers);
    refreshList(searchCriteria, currentPage);
  };

  const getProjectByNumber = (number) => {
    return projectService.getProjectByNumber(number);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects: pageResult.content || [],
        totalPages: pageResult.totalPages || 1,
        totalElements: pageResult.totalElements || 0,
        groups,
        employees,
        searchCriteria,
        setSearchCriteria,
        resetSearch,
        currentPage,
        setCurrentPage,
        createProject,
        updateProject,
        deleteProject,
        deleteProjects,
        getProjectByNumber,
        refreshProjects: () => refreshList(searchCriteria, currentPage),
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
