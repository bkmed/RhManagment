import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Illness } from '../../database/schema';

interface IllnessesState {
    items: Illness[];
}

const initialState: IllnessesState = {
    items: [],
};

const illnessesSlice = createSlice({
    name: 'illnesses',
    initialState,
    reducers: {
        setIllnesses: (state, action: PayloadAction<Illness[]>) => {
            state.items = action.payload;
        },
        addIllness: (state, action: PayloadAction<Illness>) => {
            state.items.push(action.payload);
        },
        updateIllness: (state, action: PayloadAction<Illness>) => {
            const index = state.items.findIndex((i) => i.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteIllness: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },
    },
});

export const { setIllnesses, addIllness, updateIllness, deleteIllness } = illnessesSlice.actions;

export const selectAllIllnesses = (state: { illnesses: IllnessesState }) => state.illnesses.items;

export const selectExpiringSoonIllnesses = (state: { illnesses: IllnessesState }) => {
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return state.illnesses.items.filter((illness) => {
        if (!illness.expiryDate) return false;
        const expiryDate = new Date(illness.expiryDate);
        return expiryDate >= today && expiryDate <= in30Days;
    });
};

export default illnessesSlice.reducer;
