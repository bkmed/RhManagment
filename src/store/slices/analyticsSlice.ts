import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatQuery {
    id: string;
    text: string;
    timestamp: string;
    role: 'user' | 'bot';
}

interface AnalyticsState {
    chatQueries: ChatQuery[];
}

const initialState: AnalyticsState = {
    chatQueries: [],
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        trackQuery: (state, action: PayloadAction<ChatQuery>) => {
            state.chatQueries.unshift(action.payload); // Add new query to the beginning
            // Optional: Limit the size of stored queries
            if (state.chatQueries.length > 50) {
                state.chatQueries.pop();
            }
        },
        clearQueries: (state) => {
            state.chatQueries = [];
        },
    },
});

export const { trackQuery, clearQueries } = analyticsSlice.actions;

export const selectChatQueries = (state: { analytics: AnalyticsState }) =>
    state.analytics.chatQueries;

export const selectTopQueries = (state: { analytics: AnalyticsState }) => {
    // Simple mock implementation for "Top Queries" - just returns the last 5
    return state.analytics.chatQueries.slice(0, 5);
}

export default analyticsSlice.reducer;
