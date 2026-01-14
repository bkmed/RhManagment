import { storageService } from '../services/storage';
import { PerformanceReview } from './schema';

const PERFORMANCE_KEY = 'performance_reviews';

export const performanceDb = {
  // Get all reviews
  getAll: async (): Promise<PerformanceReview[]> => {
    const json = storageService.getString(PERFORMANCE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  },

  // Get reviews by employee ID
  getByEmployeeId: async (employeeId: string): Promise<PerformanceReview[]> => {
    const all = await performanceDb.getAll();
    return all.filter(r => r.employeeId === employeeId);
  },

  // Add new review
  add: async (review: PerformanceReview): Promise<void> => {
    const reviews = await performanceDb.getAll();
    reviews.push(review);
    storageService.setString(PERFORMANCE_KEY, JSON.stringify(reviews));
  },

  // Update review
  update: async (review: PerformanceReview): Promise<void> => {
    const reviews = await performanceDb.getAll();
    const index = reviews.findIndex(r => r.id === review.id);
    if (index !== -1) {
      reviews[index] = review;
      storageService.setString(PERFORMANCE_KEY, JSON.stringify(reviews));
    }
  },

  // Delete review
  delete: async (id: string): Promise<void> => {
    const reviews = await performanceDb.getAll();
    const filtered = reviews.filter(r => r.id !== id);
    storageService.setString(PERFORMANCE_KEY, JSON.stringify(filtered));
  },
};
