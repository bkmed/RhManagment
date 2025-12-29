import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { PerformanceReview } from '../../database/schema';

interface PerformanceState {
    reviews: PerformanceReview[];
    loading: boolean;
    error: string | null;
}

const initialState: PerformanceState = {
    reviews: [],
    loading: false,
    error: null,
};

const performanceSlice = createSlice({
    name: 'performance',
    initialState,
    reducers: {
        setReviews: (state, action: PayloadAction<PerformanceReview[]>) => {
            state.reviews = action.payload;
        },
        addReview: (state, action: PayloadAction<PerformanceReview>) => {
            state.reviews.push(action.payload);
        },
        updateReview: (state, action: PayloadAction<PerformanceReview>) => {
            const index = state.reviews.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.reviews[index] = action.payload;
            }
        },
        deleteReview: (state, action: PayloadAction<number>) => {
            state.reviews = state.reviews.filter(r => r.id !== action.payload);
        },
    },
});

export const { setReviews, addReview, updateReview, deleteReview } = performanceSlice.actions;

export const selectAllReviews = (state: RootState) => state.performance.reviews;
export const selectReviewsByEmployeeId = (employeeId: number) =>
    createSelector([selectAllReviews], reviews =>
        reviews.filter(review => review.employeeId === employeeId)
    );

export default performanceSlice.reducer;
