import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Leave } from '../../database/schema';

interface LeavesState {
    items: Leave[];
}

const initialState: LeavesState = {
    items: [],
};

const leavesSlice = createSlice({
    name: 'leaves',
    initialState,
    reducers: {
        setLeaves: (state, action: PayloadAction<Leave[]>) => {
            state.items = action.payload;
        },
        addLeave: (state, action: PayloadAction<Leave>) => {
            state.items.push(action.payload);
        },
        updateLeave: (state, action: PayloadAction<Leave>) => {
            const index = state.items.findIndex((l) => l.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteLeave: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((l) => l.id !== action.payload);
        },
    },
});

export const { setLeaves, addLeave, updateLeave, deleteLeave } = leavesSlice.actions;

export const selectAllLeaves = (state: { leaves: LeavesState }) => state.leaves.items;

export const selectUpcomingLeaves = (state: { leaves: LeavesState }) => {
    const now = new Date().toISOString();
    return state.leaves.items
        .filter((l) => l.dateTime >= now)
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
};

export const selectPendingLeaves = (state: { leaves: LeavesState }) =>
    state.leaves.items.filter((l) => l.status === 'pending');

export default leavesSlice.reducer;
