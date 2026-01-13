// Database module - using MMKV for all storage
// MMKV storage is initialized in services/storage.ts and used by all database files

// Export database modules
export { currenciesDb } from './currenciesDb';
export { companySettingsDb } from './companySettingsDb';
export { departmentsDb } from './departmentsDb';
export { employeesDb } from './employeesDb';
export { servicesDb } from './servicesDb';
export { payrollDb } from './payrollDb';
export { leavesDb } from './leavesDb';
export { illnessesDb } from './illnessesDb';
export { remoteDb } from './remoteDb';
export { companiesDb } from './companiesDb';
export { teamsDb } from './teamsDb';
export { claimsDb } from './claimsDb';
export { invoicesDb } from './invoicesDb';
export { devicesDb } from './devicesDb';
export { goalsDb } from './goalsDb';

// Export schemas
export * from './schema';

// Note: All database operations use MMKV storage via storageService
// No initialization needed - MMKV is ready to use on app startup
