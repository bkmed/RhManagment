// Database module - using MMKV for all storage
// MMKV storage is initialized in services/storage.ts and used by all database files

// Export database modules
export { medicationsDb } from './medicationsDb';
export { appointmentsDb } from './appointmentsDb';
export { prescriptionsDb } from './prescriptionsDb';
export { doctorsDb } from './doctorsDb';

// Export schemas
export * from './schema';

// Note: All database operations use MMKV storage via storageService
// No initialization needed - MMKV is ready to use on app startup
