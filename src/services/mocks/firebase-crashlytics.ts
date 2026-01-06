export default () => ({
  log: (message: string) => {
    console.log('[Crashlytics Mock]', message);
  },
  crash: () => {
    console.error('[Crashlytics Mock] Triggered crash');
  },
  recordError: (error: Error) => {
    console.error('[Crashlytics Mock] Recorded error', error);
  },
  setUserId: (id: string) => {
    console.log('[Crashlytics Mock] Set User ID', id);
  },
});
