import * as Sentry from '@sentry/react';

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: 'https://example@sentry.io/placeholder', // Placeholder DSN
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

export const captureException = error => {
  Sentry.captureException(error);
};
