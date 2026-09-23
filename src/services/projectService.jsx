import { INITIAL_PROJECTS, INITIAL_GROUPS, INITIAL_EMPLOYEES } from './mockData';
import apiClient from './api';

const [K_P, K_G, K_E] = ['pim_projects', 'pim_groups', 'pim_employees'];
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch { return def; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
[[K_P, INITIAL_PROJECTS], [K_G, INITIAL_GROUPS], [K_E, INITIAL_EMPLOYEES]].forEach(([k, d]) => !localStorage.getItem(k) && save(k, d));

function checkMembersAndDates(data, employees) {
  const members = (Array.isArray(data.members) ? data.members.map(m => typeof m === 'string' ? m : m?.visa || '') : (data.members || '').split(','))
    .map(v => v.trim().toUpperCase()).filter(Boolean);
  const valid = new Set(employees.map(e => e.visa.toUpperCase()));
  const invalidVisas = members.filter(v => !valid.has(v));
  if (invalidVisas.length) throw Object.assign(new Error(`The following visas do not exist: ${invalidVisas.join(', ')}.`), { code: 'INVALID_VISAS', invalidVisas });
  if (data.endDate && data.startDate && new Date(data.endDate) <= new Date(data.startDate)) throw Object.assign(new Error('End date must be later than Start date.'), { code: 'INVALID_END_DATE' });
  return members;
}

export const projectService = {
  getProjects: () => load(K_P, INITIAL_PROJECTS),
  getGroups: () => load(K_G, INITIAL_GROUPS),
  getEmployees: () => load(K_E, INITIAL_EMPLOYEES),
  getProjectByNumber: (num) => projectService.getProjects().find(p => p.projectNumber === +num) || null,
  getProjectById: (id) => projectService.getProjects().find(p => p.id === +id) || null,

  searchProjects(criteria = {}, pageable = { page: 0, size: 5, sort: 'projectNumber,asc' }) {
    const kw = (criteria.searchTerm || criteria.keyword || '').trim().toLowerCase();
    const st = criteria.status ? criteria.status.toUpperCase() : '';
    const leader = (criteria.leaderVisa || '').trim().toLowerCase();
    const member = (criteria.memberVisa || '').trim().toLowerCase();
    const { startDateFrom: sFrom, startDateTo: sTo, endDateFrom: eFrom, endDateTo: eTo } = criteria;
    const groupMap = new Map(this.getGroups().map((g) => [g.id, (g.groupLeader?.visa || g.leaderVisa || '').toLowerCase()]));
    const [sortField = 'projectNumber', sortDir = 'asc'] = (pageable.sort || 'projectNumber,asc').split(',');

    const filtered = this.getProjects().filter((p) => {
      if (st && p.status !== st) return false;
      if (kw && !`${p.projectNumber} ${p.name} ${p.customer}`.toLowerCase().includes(kw)) return false;
      if (leader && !(p.leaderVisa || groupMap.get(p.groupId || p.group?.id) || p.group?.groupLeader?.visa || '').toLowerCase().includes(leader)) return false;
      if (member) {
        const mems = Array.isArray(p.employees) && p.employees.length
          ? p.employees.map(e => (e.visa || '').toLowerCase())
          : Array.isArray(p.members) ? p.members.map(m => (typeof m === 'string' ? m : m?.visa || '').toLowerCase()) : [];
        if (!mems.some(v => v.includes(member))) return false;
      }
      if (sFrom && p.startDate && p.startDate < sFrom) return false;
      if (sTo && p.startDate && p.startDate > sTo) return false;
      if (eFrom && (!p.endDate || p.endDate < eFrom)) return false;
      if (eTo && (!p.endDate || p.endDate > eTo)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sortField === 'projectNumber') return sortDir === 'asc' ? a.projectNumber - b.projectNumber : b.projectNumber - a.projectNumber;
      const valA = a[sortField] || '', valB = b[sortField] || '';
      const cmp = String(valA).localeCompare(String(valB));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const size = pageable.size || 5, page = pageable.page !== undefined ? pageable.page : 0;
    const totalPages = Math.ceil(filtered.length / size) || 1;
    const content = filtered.slice(page * size, (page + 1) * size);
    return { content, totalPages, totalElements: filtered.length, number: page, size, first: !page, last: page >= totalPages - 1, empty: !filtered.length };
  },

  async searchProjectsApi(criteria = {}, pageable = { page: 0, size: 5, sort: 'projectNumber,asc' }) {
    const params = {
      page: pageable.page || 0,
      size: pageable.size || 5,
      sort: pageable.sort || 'projectNumber,asc',
      keyword: (criteria.searchTerm || criteria.keyword || '').trim() || undefined,
      status: criteria.status ? criteria.status.toUpperCase() : undefined,
      leaderVisa: (criteria.leaderVisa || '').trim().toUpperCase() || undefined,
      memberVisa: (criteria.memberVisa || '').trim().toUpperCase() || undefined,
      startDateFrom: criteria.startDateFrom || undefined,
      startDateTo: criteria.startDateTo || undefined,
      endDateFrom: criteria.endDateFrom || undefined,
      endDateTo: criteria.endDateTo || undefined,
    };
    return (await apiClient.get('/projects', { params })).data;
  },

  async getProjectApi(projectId) {
    return (await apiClient.get(`/projects/${projectId}`)).data;
  },

  async createProjectApi(data) {
    const visas = (Array.isArray(data.members) ? data.members : (data.members || '').split(','))
      .map(v => typeof v === 'string' ? v.trim().toUpperCase() : v?.visa?.toUpperCase())
      .filter(Boolean);
    const payload = {
      projectNumber: +data.projectNumber,
      name: (data.name || '').trim(),
      customer: (data.customer || '').trim(),
      groupId: +data.groupId,
      status: (data.status || 'NEW').toUpperCase(),
      startDate: data.startDate,
      endDate: data.endDate || null,
      visas,
    };
    return (await apiClient.post('/projects', payload)).data;
  },

  async updateProjectApi(projectId, data) {
    const visas = (Array.isArray(data.members) ? data.members : (data.members || '').split(','))
      .map(v => typeof v === 'string' ? v.trim().toUpperCase() : v?.visa?.toUpperCase())
      .filter(Boolean);
    const payload = {
      version: data.version !== undefined ? data.version : 0,
      projectNumber: +data.projectNumber,
      name: (data.name || '').trim(),
      customer: (data.customer || '').trim(),
      groupId: +data.groupId,
      status: (data.status || 'NEW').toUpperCase(),
      startDate: data.startDate,
      endDate: data.endDate || null,
      visas,
    };
    return (await apiClient.put(`/projects/${projectId}`, payload)).data;
  },

  async deleteProjectApi(projectId) {
    return (await apiClient.delete(`/projects/${projectId}`)).data;
  },

  async deleteProjectsApi(projectIds = []) {
    return (await apiClient.delete('/projects', { data: projectIds.map(Number) })).data;
  },

  async getGroupsApi(pageable = { page: 0, size: 20, sort: 'id,asc' }) {
    const params = {
      page: pageable.page !== undefined ? pageable.page : 0,
      size: pageable.size || 20,
      sort: pageable.sort || 'id,asc',
    };
    return (await apiClient.get('/groups', { params })).data;
  },

  async searchEmployeesApi(keyword = '', pageable = { page: 0, size: 10, sort: 'visa,asc' }) {
    const kw = (keyword || '').trim();
    if (!kw) return { content: [], last: true, number: 0, size: 10, numberOfElements: 0, empty: true };
    const params = {
      keyword: kw,
      page: pageable.page !== undefined ? pageable.page : 0,
      size: pageable.size || 10,
      sort: pageable.sort || 'visa,asc',
    };
    return (await apiClient.get('/employees', { params })).data;
  },

  deleteProjects(ids = []) {
    if (!ids.length) return this.getProjects();
    const idSet = new Set(ids.map(Number)), projects = this.getProjects();
    if (projects.some(p => (idSet.has(p.id) || idSet.has(p.projectNumber)) && p.status !== 'NEW')) {
      throw Object.assign(new Error('Only projects with status "New" can be deleted.'), { code: 'INVALID_STATUS_DELETE' });
    }
    const updated = projects.filter(p => !idSet.has(p.id) && !idSet.has(p.projectNumber));
    save(K_P, updated);
    if (process.env.NODE_ENV !== 'test') {
      const realIds = projects.filter(p => idSet.has(p.id) || idSet.has(p.projectNumber)).map(p => p.id || p.projectNumber);
      this.deleteProjectsApi(realIds).catch(() => {});
    }
    return updated;
  },

  deleteProject(id) {
    const p = this.getProjectById(id) || this.getProjectByNumber(id);
    if (p && p.status !== 'NEW') throw Object.assign(new Error('Only projects with status "New" can be deleted.'), { code: 'INVALID_STATUS_DELETE' });
    const updated = this.deleteProjects([id]);
    if (process.env.NODE_ENV !== 'test') {
      this.deleteProjectApi(p?.id || id).catch(() => {});
    }
    return updated;
  },

  validateVisas: (visas) => {
    const valid = new Set(projectService.getEmployees().map(e => e.visa.toUpperCase())), invalid = visas.map(v => v.trim().toUpperCase()).filter(v => v && !valid.has(v));
    return { isValid: !invalid.length, invalidVisas: invalid };
  },

  checkProjectNumberExists: (num, exclude) => projectService.getProjects().some(p => p.projectNumber === +num && (!exclude || p.projectNumber !== +exclude)),

  createProject(data) {
    if (this.checkProjectNumberExists(+data.projectNumber)) throw Object.assign(new Error('The project number already existed. Please select a different project number'), { code: 'DUPLICATE_NUMBER' });
    const projects = this.getProjects(), nextId = projects.length ? Math.max(...projects.map(p => p.id || 0)) + 1 : 1;
    const grp = this.getGroups().find(g => g.id === +data.groupId);
    const emps = this.getEmployees();
    const members = checkMembersAndDates(data, emps);
    const memberEmployees = emps.filter(e => members.includes(e.visa.toUpperCase()));
    const item = {
      ...data,
      id: nextId,
      projectNumber: +data.projectNumber,
      name: data.name.trim(),
      customer: data.customer.trim(),
      groupId: +data.groupId,
      group: grp ? { id: grp.id, version: grp.version || 0, groupLeader: grp.groupLeader } : undefined,
      members,
      employees: memberEmployees,
      status: (data.status || 'NEW').toUpperCase(),
      version: 1,
    };
    save(K_P, [...projects, item]);
    if (process.env.NODE_ENV !== 'test') this.createProjectApi(data).catch(() => {});
    return item;
  },

  updateProject(num, data) {
    const projects = this.getProjects(), idx = projects.findIndex(p => p.projectNumber === +num);
    if (idx === -1) throw Object.assign(new Error('Project not found'), { code: 'NOT_FOUND' });
    const curr = projects[idx];
    if (data.version !== undefined && curr.version !== undefined && data.version !== curr.version) throw Object.assign(new Error('Concurrent update detected. The project has been modified by another process.'), { code: 'CONCURRENT_UPDATE' });
    const gid = +(data.groupId || curr.groupId || curr.group?.id);
    const grp = this.getGroups().find(g => g.id === gid);
    const emps = this.getEmployees();
    const members = checkMembersAndDates(data, emps);
    const memberEmployees = emps.filter(e => members.includes(e.visa.toUpperCase()));
    const updated = {
      ...curr,
      ...data,
      name: data.name.trim(),
      customer: data.customer.trim(),
      groupId: gid,
      group: grp ? { id: grp.id, version: grp.version || 0, groupLeader: grp.groupLeader } : curr.group,
      members,
      employees: memberEmployees,
      status: (data.status || curr.status || 'NEW').toUpperCase(),
      version: (curr.version || 0) + 1,
    };
    projects[idx] = updated;
    save(K_P, projects);
    if (process.env.NODE_ENV !== 'test') this.updateProjectApi(curr.id || num, data).catch(() => {});
    return updated;
  },

  resetToDefault: () => { save(K_P, INITIAL_PROJECTS); save(K_G, INITIAL_GROUPS); save(K_E, INITIAL_EMPLOYEES); }
};

export default projectService;
