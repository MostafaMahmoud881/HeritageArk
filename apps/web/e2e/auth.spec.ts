import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/••••••••/i)).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('login with valid demo credentials', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByPlaceholder(/email/i).fill('admin@heritageverse.org');
    await page.getByPlaceholder(/••••••••/i).fill('Heritage@2025');
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/\/admin|\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByPlaceholder(/email/i).fill('wrong@email.com');
    await page.getByPlaceholder(/••••••••/i).fill('wrongpassword');
    await page.getByTestId('login-submit').click();
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible();
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/en/auth/register');
    await expect(page.getByPlaceholder(/name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/characters/i)).toBeVisible();
    await expect(page.getByTestId('register-submit')).toBeVisible();
  });

  test('password reset flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByTestId('reset-submit')).toBeVisible();
  });
});
