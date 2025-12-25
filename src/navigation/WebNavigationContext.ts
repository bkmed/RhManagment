import React, { createContext } from 'react';

export const WebNavigationContext = createContext({
    activeTab: 'Home',
    subScreen: '',
    screenParams: {} as any,
    setActiveTab: (tab: string, subScreen?: string, params?: any) => { },
});
