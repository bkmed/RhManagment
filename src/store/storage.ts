import { Storage } from 'redux-persist';
import { storageService } from '../services/storage';

export const reduxStorage: Storage = {
  setItem: (key, value) => {
    storageService.setString(key, value);
    return Promise.resolve(true);
  },
  getItem: key => {
    const value = storageService.getString(key);
    return Promise.resolve(value);
  },
  removeItem: key => {
    storageService.delete(key);
    return Promise.resolve();
  },
};
