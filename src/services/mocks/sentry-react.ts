export const init = () => {
  console.log('[Sentry Mock] Initialized');
};

export const captureException = (error: any) => {
  console.error('[Sentry Mock] Captured exception:', error);
};

export const browserTracingIntegration = () => ({});
export const replayIntegration = () => ({});
