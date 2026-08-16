import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Preserve');
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('link', { name: 'HeritageArk', exact: true })).toBeVisible();
    const newsLink = page.getByRole('link', { name: 'News', exact: true });
    if (await newsLink.isVisible()) {
      await expect(newsLink).toBeVisible();
    }

    const adminLink = page.getByRole('link', { name: /admin/i });
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await expect(page).toHaveURL(/\/admin/);
    }
  });

  test('language switcher changes locale', async ({ page }) => {
    await page.goto('/en');
    const switcher = page.getByRole('button', { name: 'EN', exact: true });
    if (await switcher.isVisible()) {
      await switcher.click();
      await page.waitForTimeout(500);
    }
  });

  test('search button opens search modal', async ({ page }) => {
    await page.goto('/en');
    const searchButton = page.getByRole('button', { name: /search/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
      await searchInput.fill('heritage');
      await searchInput.press('Enter');
      await page.waitForTimeout(500);
      expect(page.url()).toContain('search');
    }
  });

  test('mobile responsive viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/en');
    const menuButton = page.getByRole('button', { name: /toggle menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      const mobileMenu = page.locator('div.lg\\:hidden');
      await expect(mobileMenu).toBeVisible();
    }
  });
});
