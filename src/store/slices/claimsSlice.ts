import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Claim } from '../../database/schema';
import { RootState } from '../index';

interface ClaimsState {
  items: Claim[];
}

const initialState: ClaimsState = {
  items: [],
};

const claimsSlice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    setClaims: (state, action: PayloadAction<Claim[]>) => {
      state.items = action.payload;
    },
    addClaim: (state, action: PayloadAction<Claim>) => {
      state.items.push(action.payload);
    },
    updateClaim: (state, action: PayloadAction<Claim>) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteClaim: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
  },
});

export const { setClaims, addClaim, updateClaim, deleteClaim } =
  claimsSlice.actions;

export const selectAllClaims = (state: RootState) => state.claims.items;

export const selectPendingClaims = createSelector([selectAllClaims], items =>
  items.filter((c: Claim) => c.status === 'pending'),
);

export default claimsSlice.reducer;
