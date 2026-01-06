import { store } from '../store';
import {
  setCurrencies,
  addCurrency as addCurrencyAction,
  updateCurrency as updateCurrencyAction,
  deleteCurrency as deleteCurrencyAction,
  selectAllCurrencies,
} from '../store/slices/currenciesSlice';
import { Currency } from './schema';

const DEFAULT_CURRENCIES: { code: string; symbol: string }[] = [
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
  { code: 'GBP', symbol: '£' },
  { code: 'TND', symbol: 'DT' },
];

export const currenciesDb = {
  // Initialize with default currencies if empty
  init: async () => {
    const existing = selectAllCurrencies(store.getState());
    if (existing.length === 0) {
      const now = new Date().toISOString();
      const initial = DEFAULT_CURRENCIES.map((desc, index) => ({
        id: index + 1,
        ...desc,
        createdAt: now,
        updatedAt: now,
      }));
      store.dispatch(setCurrencies(initial));
    }
  },

  getAll: async (): Promise<Currency[]> => {
    return selectAllCurrencies(store.getState());
  },

  add: async (code: string, symbol: string): Promise<number> => {
    const now = new Date().toISOString();
    const id = Date.now();
    const newCurrency: Currency = {
      id,
      code,
      symbol,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addCurrencyAction(newCurrency));
    return id;
  },

  update: async (id: number, code: string, symbol: string): Promise<void> => {
    const existing = selectAllCurrencies(store.getState()).find(
      c => c.id === id,
    );
    if (existing) {
      store.dispatch(
        updateCurrencyAction({
          ...existing,
          code,
          symbol,
          updatedAt: new Date().toISOString(),
        }),
      );
    }
  },

  delete: async (id: number): Promise<void> => {
    store.dispatch(deleteCurrencyAction(id));
  },
};
