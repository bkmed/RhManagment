import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        setupNodeEvents() {
            // implement node event listeners here
        },
        viewportWidth: 1280,
        viewportHeight: 720,
        specPattern: 'cypress/e2e/**/*.e2e.{js,jsx,ts,tsx}',
        video: false,
        screenshotOnRunFailure: true,
    },
});



