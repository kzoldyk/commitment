import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Management', () => {
  const timestamp = Date.now();
  const testUser = {
    username: `alex_${timestamp}`,
    email: `alex_${timestamp}@example.com`,
    password: 'Password123!',
    displayName: 'Alex Rivers',
  };

  test('should show guest CTAs on homepage when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('commitment');
    await expect(page.getByRole('link', { name: /create contract/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in to dashboard/i })).toBeVisible();
  });

  test('should prevent unauthenticated access to protected dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');
    await page.locator('input[placeholder*="hitesh"]').first().fill(testUser.username);
    await page.locator('input[placeholder*="Hitesh Prajapati"]').fill(testUser.displayName);
    await page.locator('input[placeholder*="example.com"]').fill(testUser.email);
    await page.locator('input[type="password"]').fill(testUser.password);

    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to dashboard upon successful registration
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(new RegExp(`@${testUser.username}`, 'i'))).toBeVisible();
  });

  test('should show error when signing in with incorrect password', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder*="hitesh"]').first().fill(testUser.username);
    await page.locator('input[type="password"]').fill('WrongPassword!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.locator('text=/invalid username or password|error/i')).toBeVisible();
  });

  test('should sign in with correct credentials and see personalized homepage', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[placeholder*="hitesh"]').first().fill(testUser.username);
    await page.locator('input[type="password"]').fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    // Visiting homepage while logged in should show personalized dashboard shortcut
    await page.goto('/');
    await expect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: /new contract/i })).toBeVisible();
  });

  test('should log out cleanly and redirect to login', async ({ page }) => {
    // Register a fresh logout test user
    const logoutUser = {
      username: `logout_${Date.now()}`,
      email: `logout_${Date.now()}@example.com`,
      password: 'Password123!',
      displayName: 'Logout User',
    };
    await page.goto('/register');
    await page.locator('input[placeholder*="hitesh"]').first().fill(logoutUser.username);
    await page.locator('input[placeholder*="Hitesh Prajapati"]').fill(logoutUser.displayName);
    await page.locator('input[placeholder*="example.com"]').fill(logoutUser.email);
    await page.locator('input[type="password"]').fill(logoutUser.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Click logout button in Navbar
    await page.locator('button[title="Log out"]').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
