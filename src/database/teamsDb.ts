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
    { id: 1, name: 'Équipe Développement', managerId: 3, department: 'Informatique', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 2, name: 'Équipe Logistique', managerId: 4, department: 'Opérations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 3, name: 'Équipe Marketing', managerId: 5, department: 'Ventes', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 4, name: 'Équipe Finance', managerId: 6, department: 'Finance', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 5, name: 'Équipe Support', managerId: 7, department: 'Clients', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
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
    getById: async (id: number): Promise<Team | null> => {
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
    ): Promise<number> => {
        const now = new Date().toISOString();
        const id = Date.now();

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
    update: async (id: number, updates: Partial<Team>): Promise<void> => {
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
    delete: async (id: number): Promise<void> => {
        store.dispatch(deleteTeamAction(id));
    },
};
