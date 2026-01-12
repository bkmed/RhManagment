// Type declarations for web compatibility

// Global declarations for web compatibility
declare global {
  interface Window {
    localStorage: Storage;
  }

  let window: Window & typeof globalThis;
}

export {};
