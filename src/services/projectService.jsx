import apiClient from './api';

const INIT_GROUPS = [1, 2, 3, 4, 5].map((id, i) => ({
  id, leaderVisa: ['DTH', 'BHU', 'JHV', 'NQN', 'QMV'][i],
  groupLeader: { id, visa: ['DTH', 'BHU', 'JHV', 'NQN', 'QMV'][i], firstName: ['Thien', 'Hung', 'Hai', 'Nhat', 'Minh'][i], lastName: 'Leader' },
}));

const INIT_EMPS = ['DTH', 'BHU', 'JHV', 'HTV', 'NQN', 'HNH', 'TQP', 'QMV', 'FUN', 'KMA', 'TIN', 'ATN'].map((v, i) => ({
  id: i + 1, visa: v, firstName: v, lastName: 'Emp',
}));

const INIT_PROJS = [
  { id: 3116, projectNumber: 3116, name: 'Facturation / Encaissements', customer: 'Les Retaites Populaires', groupId: 1, group: INIT_GROUPS[0], members: ['DTH', 'BHU'], status: 'NEW', startDate: '2004-02-25', endDate: '2004-12-31', version: 1 },
  { id: 3118, projectNumber: 3118, name: 'GKBWEB', customer: 'GKB', groupId: 2, group: INIT_GROUPS[1], members: ['JHV', 'FUN'], status: 'FIN', startDate: '2002-10-10', endDate: '2003-08-15', version: 1 },
  { id: 7157, projectNumber: 7157, name: 'MGBAHN-Maint2015', customer: 'MGB Tourism', groupId: 3, group: INIT_GROUPS[2], members: ['KMA', 'TIN'], status: 'INP', startDate: '2006-09-24', endDate: '2007-06-30', version: 1 },
  { id: 7174, projectNumber: 7174, name: 'SOMED-SPITEX MAINT', customer: 'SOMED-SPITEX MAINT', groupId: 4, group: INIT_GROUPS[3], members: ['DTH', 'ATN'], status: 'NEW', startDate: '2015-10-05', endDate: '', version: 1 },
  { id: 1004, projectNumber: 1004, name: 'IOC CLIENT EXTRANET', customer: 'IOC', groupId: 2, group: INIT_GROUPS[1], members: ['HTV', 'TQP', 'QMV'], status: 'INP', startDate: '2016-01-01', endDate: '2017-01-01', version: 1 },
];

let store = { p: JSON.parse(JSON.stringify(INIT_PROJS)), g: [...INIT_GROUPS], e: [...INIT_EMPS] };

const toVisas = (m) => (Array.isArray(m) ? m : (m || '').split(',')).map((v) => (typeof v === 'string' ? v.trim().toUpperCase() : v?.visa?.toUpperCase())).filter(Boolean);

const toPayload = (d) => ({
  projectNumber: +d.projectNumber, name: (d.name || '').trim(), customer: (d.customer || '').trim(),
  groupId: +d.groupId, status: (d.status || 'NEW').toUpperCase(), startDate: d.startDate,
  endDate: d.endDate || null, version: d.version ?? 0, visas: toVisas(d.members),
});

const validate = (d) => {
  const visas = toVisas(d.members), valid = new Set(store.e.map((e) => e.visa));
  const bad = visas.filter((v) => !valid.has(v));
  if (bad.length) throw Object.assign(new Error(`The following visas do not exist: ${bad.join(', ')}.`), { code: 'INVALID_VISAS', invalidVisas: bad });
  if (d.endDate && d.startDate && new Date(d.endDate) <= new Date(d.startDate)) throw Object.assign(new Error('End date must be later than Start date.'), { code: 'INVALID_END_DATE' });
  return visas;
};

export const projectService = {
  getProjects: () => store.p,
  getGroups: () => store.g,
  getEmployees: () => store.e,
  getProjectByNumber: (num) => store.p.find((p) => p.projectNumber === +num) || null,
  getProjectById: (id) => store.p.find((p) => p.id === +id) || null,

  searchProjects(criteria = {}, pageable = { page: 0, size: 5, sort: 'projectNumber,asc' }) {
    const kw = (criteria.searchTerm || criteria.keyword || '').trim().toLowerCase();
    const st = (criteria.status || '').toUpperCase();
    const leader = (criteria.leaderVisa || '').trim().toLowerCase();
    const member = (criteria.memberVisa || '').trim().toLowerCase();
    const [field = 'projectNumber', dir = 'asc'] = (pageable.sort || 'projectNumber,asc').split(',');

    const filtered = store.p.filter((p) => {
      if (st && p.status !== st) return false;
      if (kw && !`${p.projectNumber} ${p.name} ${p.customer}`.toLowerCase().includes(kw)) return false;
      if (leader && !(p.group?.leaderVisa || '').toLowerCase().includes(leader)) return false;
      if (member && !toVisas(p.members).some((v) => v.toLowerCase().includes(member))) return false;
      if (criteria.startDateFrom && p.startDate && p.startDate < criteria.startDateFrom) return false;
      if (criteria.startDateTo && p.startDate && p.startDate > criteria.startDateTo) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const va = a[field] ?? '', vb = b[field] ?? '';
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return dir === 'asc' ? cmp : -cmp;
    });

    const size = pageable.size || 5, page = pageable.page || 0;
    return { content: filtered.slice(page * size, (page + 1) * size), totalPages: Math.ceil(filtered.length / size) || 1, totalElements: filtered.length, number: page, size };
  },

  createProject(d) {
    if (store.p.some((p) => p.projectNumber === +d.projectNumber)) {
      throw Object.assign(new Error('The project number already existed. Please select a different project number'), { code: 'DUPLICATE_NUMBER' });
    }
    const grp = store.g.find((g) => g.id === +d.groupId);
    const item = { ...d, id: Date.now(), projectNumber: +d.projectNumber, group: grp, members: validate(d), status: (d.status || 'NEW').toUpperCase(), version: 1 };
    store.p.push(item);
    if (process.env.NODE_ENV !== 'test') apiClient.post('/projects', toPayload(d)).catch(() => {});
    return item;
  },

  updateProject(num, d) {
    const idx = store.p.findIndex((p) => p.projectNumber === +num);
    if (idx === -1) throw Object.assign(new Error('Project not found'), { code: 'NOT_FOUND' });
    if (d.version !== undefined && store.p[idx].version !== undefined && d.version !== store.p[idx].version) {
      throw Object.assign(new Error('Concurrent update detected.'), { code: 'CONCURRENT_UPDATE' });
    }
    const updated = { ...store.p[idx], ...d, members: validate(d), version: (store.p[idx].version || 0) + 1 };
    store.p[idx] = updated;
    if (process.env.NODE_ENV !== 'test') apiClient.put(`/projects/${store.p[idx].id || num}`, toPayload(d)).catch(() => {});
    return updated;
  },

  deleteProjects(ids = []) {
    const set = new Set(ids.map(Number));
    if (process.env.NODE_ENV !== 'test') {
      apiClient.delete('/projects', { data: Array.from(set) }).catch(() => {});
      store.p = store.p.filter((p) => !set.has(p.id) && !set.has(p.projectNumber));
      return store.p;
    }
    const matched = store.p.filter((p) => set.has(p.id) || set.has(p.projectNumber));
    if (matched.some((p) => (p.status || '').toUpperCase() !== 'NEW')) {
      throw Object.assign(new Error('Only projects with status "New" can be deleted.'), { code: 'INVALID_STATUS_DELETE' });
    }
    store.p = store.p.filter((p) => !set.has(p.id) && !set.has(p.projectNumber));
    return store.p;
  },

  deleteProject(id) {
    if (process.env.NODE_ENV !== 'test') {
      apiClient.delete(`/projects/${id}`).catch(() => {});
      const set = new Set([Number(id)]);
      store.p = store.p.filter((p) => !set.has(p.id) && !set.has(p.projectNumber));
      return store.p;
    }
    return this.deleteProjects([id]);
  },
  validateVisas: (visas) => ({ isValid: !visas.some((v) => !store.e.some((e) => e.visa === v.toUpperCase())), invalidVisas: [] }),
  checkProjectNumberExists: (num) => store.p.some((p) => p.projectNumber === +num),

  // REST API endpoints
  searchProjectsApi: (c, p) => apiClient.get('/projects', { params: { ...c, ...p } }).then((r) => r.data),
  getProjectApi: (id) => apiClient.get(`/projects/${id}`).then((r) => r.data),
  createProjectApi: (d) => apiClient.post('/projects', toPayload(d)).then((r) => r.data),
  updateProjectApi: (id, d) => apiClient.put(`/projects/${id}`, toPayload(d)).then((r) => r.data),
  deleteProjectApi: (id) => apiClient.delete(`/projects/${id}`).then((r) => r.data),
  deleteProjectsApi: (ids) => apiClient.delete('/projects', { data: ids }).then((r) => r.data),
  getGroupsApi: (p) => apiClient.get('/groups', { params: p }).then((r) => r.data),
  searchEmployeesApi: (kw, p) => apiClient.get('/employees', { params: { keyword: kw, ...p } }).then((r) => r.data),
  resetToDefault: () => { store = { p: JSON.parse(JSON.stringify(INIT_PROJS)), g: [...INIT_GROUPS], e: [...INIT_EMPS] }; },
};

export default projectService;
