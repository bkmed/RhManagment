import { store } from '../store';
import {
  addTeam as addTeamAction,
  updateTeam as updateTeamAction,
  deleteTeam as deleteTeamAction,
  selectAllTeams,
  selectTeamById,
} from '../store/slices/teamsSlice';
import { Team } from './schema';

const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Tech Development',
    managerId: '3',
    companyId: '1',
    department: 'Information Technology',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Global Marketing',
    managerId: '4',
    companyId: '1',
    department: 'Marketing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Finance & Legal',
    managerId: '5',
    companyId: '1',
    department: 'Finance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Eco Operations',
    managerId: '6',
    companyId: '2',
    department: 'Operations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Green Sales',
    managerId: '7',
    companyId: '2',
    department: 'Sales',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Logistics Plus',
    managerId: '8',
    companyId: '2',
    department: 'Logistics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

if (selectAllTeams(store.getState()).length === 0) {
  const { setTeams } = require('../store/slices/teamsSlice');
  store.dispatch(setTeams(MOCK_TEAMS));
}

export const teamsDb = {
  // Get all teams
  getAll: async (): Promise<Team[]> => {
    const teams = selectAllTeams(store.getState());
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Get team by ID
  getById: async (id: string): Promise<Team | null> => {
    return selectTeamById(id)(store.getState()) || null;
  },

  // Get teams by department
  getByDepartment: async (department: string): Promise<Team[]> => {
    const teams = selectAllTeams(store.getState());
    return teams.filter(t => t.department === department);
  },

  // Add new team
  add: async (
    team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();

    const newTeam: Team = {
      ...team,
      id,
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addTeamAction(newTeam));
    return id;
  },

  // Update team
  update: async (id: string, updates: Partial<Team>): Promise<void> => {
    const existing = selectTeamById(id)(store.getState());

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateTeamAction(updated));
    }
  },

  // Delete team
  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteTeamAction(id));
  },
};
