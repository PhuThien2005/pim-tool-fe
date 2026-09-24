import { projectService } from './projectService';

describe('projectService Unit Tests', () => {
  beforeEach(() => {
    projectService.resetToDefault();
  });

  test('getProjects returns initial list of projects sorted or accessible', async () => {
    const projects = await projectService.getProjects();
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.some((p) => p.projectNumber === 3116)).toBe(true);
  });

  test('getProjectByNumber returns matching project', () => {
    const project = projectService.getProjectByNumber(3116);
    expect(project).toBeDefined();
    expect(project.name).toBe('Facturation / Encaissements');
  });

  test('createProject successfully creates a project with valid data', async () => {
    const newProj = {
      projectNumber: 9999,
      name: 'New Test Project',
      customer: 'Test Customer',
      groupId: 1,
      members: 'DTH, BHU',
      status: 'NEW',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    };

    const created = await projectService.createProject(newProj);
    expect(created.projectNumber).toBe(9999);
    expect(created.members).toEqual(['DTH', 'BHU']);

    const retrieved = projectService.getProjectByNumber(9999);
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('New Test Project');
  });

  test('createProject throws DUPLICATE_NUMBER when number already exists', async () => {
    const duplicate = {
      projectNumber: 3116,
      name: 'Duplicate Number Proj',
      customer: 'Test',
      groupId: 1,
      status: 'NEW',
      startDate: '2026-01-01',
    };

    await expect(projectService.createProject(duplicate)).rejects.toThrow(
      'The project number already existed. Please select a different project number'
    );
  });

  test('createProject throws INVALID_VISAS when invalid visa is supplied', async () => {
    const invalidVisaProj = {
      projectNumber: 9001,
      name: 'Invalid Visa Proj',
      customer: 'Test',
      groupId: 1,
      members: 'DTH, UNKNOWN_VISA_1, UNKNOWN_VISA_2',
      status: 'NEW',
      startDate: '2026-01-01',
    };

    try {
      await projectService.createProject(invalidVisaProj);
      fail('Should have thrown INVALID_VISAS');
    } catch (err) {
      expect(err.code).toBe('INVALID_VISAS');
      expect(err.invalidVisas).toContain('UNKNOWN_VISA_1');
      expect(err.invalidVisas).toContain('UNKNOWN_VISA_2');
    }
  });

  test('createProject throws INVALID_END_DATE when end date is earlier than start date', async () => {
    const invalidDateProj = {
      projectNumber: 9002,
      name: 'Invalid Date Proj',
      customer: 'Test',
      groupId: 1,
      status: 'NEW',
      startDate: '2026-05-10',
      endDate: '2026-05-01',
    };

    try {
      await projectService.createProject(invalidDateProj);
      fail('Should have thrown INVALID_END_DATE');
    } catch (err) {
      expect(err.code).toBe('INVALID_END_DATE');
    }
  });

  test('updateProject updates existing project and increments version', async () => {
    const updateData = {
      name: 'Updated Facturation',
      customer: 'New Customer Name',
      groupId: 2,
      members: ['DTH'],
      status: 'INP',
      startDate: '2004-02-25',
      endDate: '2005-01-01',
      version: 1,
    };

    const updated = await projectService.updateProject(3116, updateData);
    expect(updated.name).toBe('Updated Facturation');
    expect(updated.status).toBe('INP');
    expect(updated.version).toBe(2);
  });

  test('updateProject detects concurrent update error when version does not match', async () => {
    const concurrentData = {
      name: 'Concurrent Edit',
      customer: 'Customer',
      groupId: 1,
      status: 'NEW',
      startDate: '2004-02-25',
      version: 99, // mismatch
    };

    await expect(projectService.updateProject(3116, concurrentData)).rejects.toThrow(
      'Concurrent update detected'
    );
  });

  test('deleteProjects allows deleting projects with status NEW', async () => {
    // Project 3116 has status NEW
    await projectService.deleteProjects([3116]);
    expect(projectService.getProjectByNumber(3116)).toBeNull();
  });

  test('deleteProjects throws error when attempting to delete non-NEW project', async () => {
    // Project 3118 has status FIN
    await expect(projectService.deleteProjects([3118])).rejects.toThrow(
      'Only projects with status "New" can be deleted.'
    );
    expect(projectService.getProjectByNumber(3118)).toBeDefined();
  });

  test('searchProjects filters by advanced criteria (memberVisas and date range)', async () => {
    // Search with memberVisas DTH
    const resMember = await projectService.searchProjects({ memberVisas: 'DTH' });
    expect(resMember.content.length).toBeGreaterThan(0);
    expect(resMember.content.every((p) => p.members.includes('DTH'))).toBe(true);

    // Search with date range >= 2005-01-01
    const resDate = await projectService.searchProjects({ startDateFrom: '2005-01-01' });
    expect(resDate.content.every((p) => p.startDate >= '2005-01-01')).toBe(true);
  });

  test('searchProjects sorts dynamically by column name ascending and descending', async () => {
    const resAsc = await projectService.searchProjects({}, { page: 0, size: 10, sort: 'name,asc' });
    for (let i = 0; i < resAsc.content.length - 1; i++) {
      expect(resAsc.content[i].name.localeCompare(resAsc.content[i + 1].name)).toBeLessThanOrEqual(0);
    }

    const resDesc = await projectService.searchProjects({}, { page: 0, size: 10, sort: 'name,desc' });
    for (let i = 0; i < resDesc.content.length - 1; i++) {
      expect(resDesc.content[i].name.localeCompare(resDesc.content[i + 1].name)).toBeGreaterThanOrEqual(0);
    }
  });
});
