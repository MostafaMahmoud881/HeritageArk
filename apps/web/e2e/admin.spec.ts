import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByPlaceholder(/email/i).fill('admin@heritageverse.org');
    await page.getByPlaceholder(/••••••••/i).fill('Heritage@2025');
    await page.getByTestId('login-submit').click();
    await page.waitForURL(/\/admin|\/dashboard/, { timeout: 15000 });
  });

  test('admin login redirects to admin dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin|\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('CMS page loads articles table', async ({ page }) => {
    await page.goto('/admin/cms');
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /title/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
  });

  test('editor page loads with form fields', async ({ page }) => {
    await page.goto('/admin/cms/editor');
    await expect(page.getByPlaceholder(/article title/i)).toBeVisible();
    await expect(page.getByPlaceholder(/start writing/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category' })).toBeVisible();
    await expect(page.getByRole('button', { name: /save draft|publish/i }).first()).toBeVisible();
  });

  test('media page loads with grid', async ({ page }) => {
    await page.goto('/admin/media');
    await expect(page.getByRole('heading', { name: /media library/i })).toBeVisible();
  });
});
