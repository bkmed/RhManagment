import { storageService } from '../services/storage';
import { Goal } from './schema';

const GOALS_KEY = 'goals_data';

export const goalsDb = {
  // Get all goals
  getAll: async (): Promise<Goal[]> => {
    const json = storageService.getString(GOALS_KEY);
    if (!json) return [];
    return JSON.parse(json);
  },

  // Get goals by employee ID
  getByEmployeeId: async (employeeId: string): Promise<Goal[]> => {
    const allGoals = await goalsDb.getAll();
    return allGoals.filter(g => g.employeeId === employeeId);
  },

  // Add new goal
  add: async (goal: Goal): Promise<void> => {
    const goals = await goalsDb.getAll();
    goals.push(goal);
    storageService.setString(GOALS_KEY, JSON.stringify(goals));
  },

  // Update goal
  update: async (goal: Goal): Promise<void> => {
    const goals = await goalsDb.getAll();
    const index = goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      goals[index] = goal;
      storageService.setString(GOALS_KEY, JSON.stringify(goals));
    }
  },

  // Delete goal
  delete: async (id: string): Promise<void> => {
    const goals = await goalsDb.getAll();
    const filtered = goals.filter(g => g.id !== id);
    storageService.setString(GOALS_KEY, JSON.stringify(filtered));
  },
};
