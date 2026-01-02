// Database module - using MMKV for all storage
// MMKV storage is initialized in services/storage.ts and used by all database files

// Export database modules
export { payrollDb } from './payrollDb';
export { leavesDb } from './leavesDb';
export { illnessesDb } from './illnessesDb';
export { remoteDb } from './remoteDb';
export { employeesDb } from './employeesDb';
export { servicesDb } from './servicesDb';
export { currenciesDb } from './currenciesDb';

// Export schemas
export * from './schema';

// Note: All database operations use MMKV storage via storageService
// No initialization needed - MMKV is ready to use on app startup
