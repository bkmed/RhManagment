import { store } from '../store';
import {
  addTeam as addTeamAction,
  updateTeam as updateTeamAction,
  deleteTeam as deleteTeamAction,
  selectAllTeams,
  selectTeamById,
} from '../store/slices/teamsSlice';
import { Team } from './schema';

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
