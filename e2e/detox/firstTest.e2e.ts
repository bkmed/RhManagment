import { device, element, by, expect } from 'detox';
describe('HR Management App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on app launch', async () => {
    await expect(element(by.text('Login to HR Portal'))).toBeVisible();
    await expect(element(by.text('Login'))).toBeVisible();
    await expect(element(by.text('Register'))).toBeVisible();
  });

  it('should show validation error on empty login', async () => {
    await element(by.text('Login')).tap();
    await expect(
      element(by.text('Email and password are required')),
    ).toBeVisible();
  });

  it('should navigate to register screen', async () => {
    await element(by.text('Register')).tap();
    await expect(element(by.text('Create an Account'))).toBeVisible();
    await expect(element(by.text('Register'))).toBeVisible();
  });

  it('should navigate back to login screen', async () => {
    await element(by.text('Register')).tap();
    await element(by.text('Login')).tap();
    await expect(element(by.text('Login to HR Portal'))).toBeVisible();
  });
});
