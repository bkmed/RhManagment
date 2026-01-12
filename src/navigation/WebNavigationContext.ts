import { createContext } from 'react';

export const WebNavigationContext = createContext({
  activeTab: 'Home',
  subScreen: '',
  screenParams: {} as Record<string, unknown>,
  /* eslint-disable @typescript-eslint/no-unused-vars */
  setActiveTab: (
    _tab: string,
    _subScreen?: string,
    _params?: Record<string, unknown>,
  ) => {},
  /* eslint-enable @typescript-eslint/no-unused-vars */
});
