import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import { reduxStorage } from './storage';

// Import slices (we will create them next)
import authReducer from './slices/authSlice';
import leavesReducer from './slices/leavesSlice';
import employeesReducer from './slices/employeesSlice';
import payrollReducer from './slices/payrollSlice';
import claimsReducer from './slices/claimsSlice';
import illnessesReducer from './slices/illnessesSlice';
import companiesReducer from './slices/companiesSlice';
import teamsReducer from './slices/teamsSlice';
import goalsReducer from './slices/goalsSlice';
import performanceReducer from './slices/performanceSlice';
import announcementsReducer from './slices/announcementsSlice';
import notificationsReducer from './slices/notificationsSlice';
import messagesReducer from './slices/messagesSlice';
import servicesReducer from './slices/servicesSlice';
import departmentsReducer from './slices/departmentsSlice';
import currenciesReducer from './slices/currenciesSlice';
import companySettingsReducer from './slices/companySettingsSlice';

import analyticsReducer from './slices/analyticsSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    leaves: leavesReducer,
    employees: employeesReducer,
    payroll: payrollReducer,
    claims: claimsReducer,
    illnesses: illnessesReducer,
    companies: companiesReducer,
    teams: teamsReducer,
    goals: goalsReducer,
    performance: performanceReducer,
    announcements: announcementsReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
    services: servicesReducer,
    departments: departmentsReducer,
    currencies: currenciesReducer,
    companySettings: companySettingsReducer,
    analytics: analyticsReducer,
});

const persistConfig = {
    key: 'root',
    storage: reduxStorage,
    whitelist: ['auth', 'leaves', 'employees', 'payroll', 'claims', 'illnesses', 'companies', 'teams', 'goals', 'performance', 'announcements', 'notifications', 'messages', 'services', 'currencies', 'analytics', 'companySettings', 'departments'], // add slices here to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
