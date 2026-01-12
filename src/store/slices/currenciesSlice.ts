import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Currency } from '../../database/schema';

interface CurrenciesState {
  items: Currency[];
  loading: boolean;
  error: string | null;
}

const initialState: CurrenciesState = {
  items: [],
  loading: false,
  error: null,
};

const currenciesSlice = createSlice({
  name: 'currencies',
  initialState,
  reducers: {
    setCurrencies: (state, action: PayloadAction<Currency[]>) => {
      state.items = action.payload;
    },
    addCurrency: (state, action: PayloadAction<Currency>) => {
      state.items.push(action.payload);
    },
    updateCurrency: (state, action: PayloadAction<Currency>) => {
      const index = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCurrency: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { setCurrencies, addCurrency, updateCurrency, deleteCurrency } =
  currenciesSlice.actions;

export const selectAllCurrencies = (state: { currencies: CurrenciesState }) =>
  state.currencies.items;
export const selectCurrencyById =
  (id: string) => (state: { currencies: CurrenciesState }) =>
    state.currencies.items.find(c => c.id === id);

export default currenciesSlice.reducer;
