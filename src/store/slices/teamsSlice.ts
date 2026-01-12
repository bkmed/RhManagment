import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team } from '../../database/schema';

interface TeamsState {
  items: Team[];
}

const initialState: TeamsState = {
  items: [],
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.items = action.payload;
    },
    addTeam: (state, action: PayloadAction<Team>) => {
      state.items.push(action.payload);
    },
    updateTeam: (state, action: PayloadAction<Team>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTeam: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
  },
});

export const { setTeams, addTeam, updateTeam, deleteTeam } = teamsSlice.actions;

export const selectAllTeams = (state: { teams: TeamsState }) =>
  state.teams.items;

export const selectTeamById = (id: string) => (state: { teams: TeamsState }) =>
  state.teams.items.find(t => t.id === id);

export default teamsSlice.reducer;
