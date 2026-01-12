import { storageService } from '../services/storage';
import { ReviewPeriod } from './schema';

const REVIEW_PERIODS_KEY = 'review_periods';

export const reviewPeriodsDb = {
    getAll: async (): Promise<ReviewPeriod[]> => {
        const json = storageService.getString(REVIEW_PERIODS_KEY);
        return json ? JSON.parse(json) : [];
    },

    getById: async (id: string): Promise<ReviewPeriod | undefined> => {
        const periods = await reviewPeriodsDb.getAll();
        return periods.find(p => p.id === id);
    },

    add: async (period: Omit<ReviewPeriod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
        const periods = await reviewPeriodsDb.getAll();
        const id = Date.now().toString();
        const newPeriod: ReviewPeriod = {
            ...period,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        periods.push(newPeriod);
        storageService.setString(REVIEW_PERIODS_KEY, JSON.stringify(periods));
        return id;
    },

    update: async (id: string, updates: Partial<ReviewPeriod>): Promise<void> => {
        const periods = await reviewPeriodsDb.getAll();
        const index = periods.findIndex(p => p.id === id);
        if (index !== -1) {
            periods[index] = { ...periods[index], ...updates, updatedAt: new Date().toISOString() };
            storageService.setString(REVIEW_PERIODS_KEY, JSON.stringify(periods));
        }
    },

    delete: async (id: string): Promise<void> => {
        const periods = await reviewPeriodsDb.getAll();
        const filtered = periods.filter(p => p.id !== id);
        storageService.setString(REVIEW_PERIODS_KEY, JSON.stringify(filtered));
    }
};
