import { device, element, by, expect } from 'detox';
describe('Authentication Flow', () => {
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

  it('should show validation error on empty register form', async () => {
    await element(by.text('Register')).tap();
    await element(by.text('Register')).tap();
    await expect(element(by.text('All fields are required'))).toBeVisible();
  });

  it('should show password mismatch error', async () => {
    await element(by.text('Register')).tap();
    await element(by.placeholder('Enter your full name')).typeText('Test User');
    await element(by.placeholder('Enter your email')).typeText(
      'test@example.com',
    );
    await element(by.placeholder('Create a password')).typeText('password123');
    await element(by.placeholder('Confirm your password')).typeText(
      'password456',
    );
    await element(by.text('Register')).tap();
    await expect(element(by.text('Passwords do not match'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    // This test requires a mock or a test user in your Firebase
    // For testing purposes, we'll assume the login is successful
    await element(by.placeholder('Enter your email')).typeText(
      'test@example.com',
    );
    await element(by.placeholder('Enter your password')).typeText(
      'password123',
    );
    await element(by.text('Login')).tap();

    // Check if we're redirected to the home screen
    await expect(element(by.text('Home'))).toBeVisible();
  });

  it('should logout successfully', async () => {
    // First login
    await element(by.placeholder('Enter your email')).typeText(
      'test@example.com',
    );
    await element(by.placeholder('Enter your password')).typeText(
      'password123',
    );
    await element(by.text('Login')).tap();

    // Navigate to profile
    await element(by.text('Profile')).tap();

    // Logout
    await element(by.text('Logout')).tap();

    // Check if we're back at the login screen
    await expect(element(by.text('Login to HR Portal'))).toBeVisible();
  });
});
