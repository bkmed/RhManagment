import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Leave } from '../../database/schema';
import { RootState } from '../index';

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

export const selectAllLeaves = (state: RootState) => state.leaves.items;

export const selectUpcomingLeaves = createSelector(
    [selectAllLeaves],
    (items) => {
        const now = new Date().toISOString();
        return items
            .filter((l: Leave) => (l.status === 'pending' || (l.startDate && l.startDate >= now)))
            .sort((a: Leave, b: Leave) => {
                if (!a.startDate || !b.startDate) return 0;
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            });
    }
);

export const selectPendingLeaves = createSelector(
    [selectAllLeaves],
    (items) => items.filter((l: Leave) => l.status === 'pending')
);

export default leavesSlice.reducer;
