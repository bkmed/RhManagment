// Database module - using MMKV for all storage
// MMKV storage is initialized in services/storage.ts and used by all database files

// Export database modules
export { payrollDb } from './payrollDb';
export { leavesDb } from './leavesDb';
export { illnessesDb } from './illnessesDb';
export { employeesDb } from './employeesDb';

// Export schemas
export * from './schema';

// Note: All database operations use MMKV storage via storageService
// No initialization needed - MMKV is ready to use on app startup
