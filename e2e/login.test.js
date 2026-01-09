describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('admin@demo.com');
    await element(by.id('password-input')).typeText('admin123');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should show error on bad login', async () => {
    await element(by.id('email-input')).typeText('bad@email.com');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
