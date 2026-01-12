import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Goal } from '../../database/schema';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
    },
    addGoal: (state, action: PayloadAction<Goal>) => {
      state.goals.push(action.payload);
    },
    updateGoal: (state, action: PayloadAction<Goal>) => {
      const index = state.goals.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter(g => g.id !== action.payload);
    },
  },
});

export const { setGoals, addGoal, updateGoal, deleteGoal } = goalsSlice.actions;

export const selectAllGoals = (state: RootState) => state.goals.goals;
export const selectGoalsByEmployeeId = (employeeId: string) =>
  createSelector([selectAllGoals], goals =>
    goals.filter(goal => goal.employeeId === employeeId),
  );

export default goalsSlice.reducer;
