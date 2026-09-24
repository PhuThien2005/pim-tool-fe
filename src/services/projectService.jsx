import apiClient from './api';

const toPayload = (d) => ({
  projectNumber: +d.projectNumber,
  name: (d.name || '').trim(),
  customer: (d.customer || '').trim(),
  groupId: +d.groupId,
  status: (d.status || 'NEW').toUpperCase(),
  startDate: d.startDate,
  endDate: d.endDate || null,
  version: d.version ?? 0,
  visas: (Array.isArray(d.members) ? d.members : (d.members || '').split(','))
    .map((v) => (typeof v === 'string' ? v.trim().toUpperCase() : v?.visa?.toUpperCase()))
    .filter(Boolean),
});

export const projectService = {
  searchProjects: (criteria = {}, pageable = {}) =>
    apiClient.get('/projects', { params: { ...criteria, ...pageable } }).then((r) => r.data),

  getProjectByNumber: (num) =>
    apiClient.get(`/projects/${num}`).then((r) => r.data),

  getProjectById: (id) =>
    apiClient.get(`/projects/${id}`).then((r) => r.data),

  createProject: (data) =>
    apiClient.post('/projects', toPayload(data)).then((r) => r.data),

  updateProject: (id, data) =>
    apiClient.put(`/projects/${id}`, toPayload(data)).then((r) => r.data),

  deleteProject: (id) =>
    apiClient.delete(`/projects/${id}`).then((r) => r.data),

  deleteProjects: (ids = []) =>
    apiClient.request({ method: 'delete', url: '/projects', data: ids }).then((r) => r.data),

  getGroups: (pageable = { page: 0, size: 50, sort: 'id,asc' }) =>
    apiClient.get('/groups', { params: pageable }).then((r) => r.data?.content || r.data || []),

  getEmployees: (pageable = { page: 0, size: 50, sort: 'visa,asc' }) =>
    apiClient.get('/employees', { params: pageable }).then((r) => r.data?.content || r.data || []),

  searchEmployees: (keyword = '', pageable = { page: 0, size: 20 }) =>
    apiClient.get('/employees', { params: { keyword, ...pageable } }).then((r) => r.data?.content || r.data || []),

  // Compatibility aliases
  searchProjectsApi: (c, p) => projectService.searchProjects(c, p),
  getProjectApi: (id) => projectService.getProjectById(id),
  createProjectApi: (d) => projectService.createProject(d),
  updateProjectApi: (id, d) => projectService.updateProject(id, d),
  deleteProjectApi: (id) => projectService.deleteProject(id),
  deleteProjectsApi: (ids) => projectService.deleteProjects(ids),
  getGroupsApi: (p) => apiClient.get('/groups', { params: p }).then((r) => r.data),
  searchEmployeesApi: (kw, p) => apiClient.get('/employees', { params: { keyword: kw, ...p } }).then((r) => r.data),
  resetToDefault: () => {},
};

export default projectService;
