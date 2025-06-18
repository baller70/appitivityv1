import { test, expect } from '@playwright/test';

test.describe('BookmarkHub Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3000');
  });

  test('dashboard loads with correct title and structure', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/BookmarkHub/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('BookmarkHub');
    
    // Check sidebar is visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('sidebar navigation works correctly', async ({ page }) => {
    // Check navigation items are present
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
    await expect(page.locator('text=Favorites')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
    
    // Check categories section
    await expect(page.locator('text=Categories')).toBeVisible();
    await expect(page.locator('text=Development')).toBeVisible();
    await expect(page.locator('text=Design')).toBeVisible();
    await expect(page.locator('text=Productivity')).toBeVisible();
  });

  test('sidebar toggle functionality', async ({ page }) => {
    // Find and click the sidebar toggle button
    const toggleButton = page.locator('button').filter({ hasText: /menu|bars/i }).first();
    
    // Get initial sidebar width
    const sidebar = page.locator('[data-testid="sidebar"]');
    const initialWidth = await sidebar.evaluate(el => (el as HTMLElement).offsetWidth);
    
    // Click toggle button
    await toggleButton.click();
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Check that sidebar width has changed (collapsed)
    const newWidth = await sidebar.evaluate(el => (el as HTMLElement).offsetWidth);
    expect(newWidth).toBeLessThan(initialWidth);
    
    // Click again to expand
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Check that sidebar is expanded again
    const expandedWidth = await sidebar.evaluate(el => (el as HTMLElement).offsetWidth);
    expect(expandedWidth).toBeGreaterThan(newWidth);
  });

  test('dashboard statistics are displayed', async ({ page }) => {
    // Check that all stat cards are present
    await expect(page.locator('text=Total Bookmarks')).toBeVisible();
    await expect(page.locator('text=This Month')).toBeVisible();
    await expect(page.locator('text=Total Visits')).toBeVisible();
    await expect(page.locator('text=Favorites')).toBeVisible();
    
    // Check that stat values are displayed
    const totalBookmarksValue = await page.locator('text=Total Bookmarks').locator('..').locator('text=/^\\d+$/').first();
    await expect(totalBookmarksValue).toBeVisible();

    const totalVisitsValue = await page.locator('text=Total Visits').locator('..').locator('text=/^\\d+$/').first();
    await expect(totalVisitsValue).toBeVisible();

    const favoritesValue = await page.locator('text=Favorites').locator('..').locator('text=/^\\d+$/').first();
    await expect(favoritesValue).toBeVisible();
  });

  test('bookmark grid displays correctly', async ({ page }) => {
    // Check that bookmark cards are displayed
    const bookmarkCards = page.locator('[data-testid="bookmark-card"]');
    await expect(bookmarkCards).toHaveCount(6);
    
    // Check specific bookmarks are present
    await expect(page.locator('text=GitHub')).toBeVisible();
    await expect(page.locator('text=Figma')).toBeVisible();
    await expect(page.locator('text=Stack Overflow')).toBeVisible();
    await expect(page.locator('text=Notion')).toBeVisible();
    await expect(page.locator('text=Dribbble')).toBeVisible();
    await expect(page.locator('text=Linear')).toBeVisible();
  });

  test('bookmark cards contain expected information', async ({ page }) => {
    // Check first bookmark card (GitHub)
    const githubCard = page.locator('text=GitHub').locator('..').locator('..');
    
    await expect(githubCard.locator('text=https://github.com')).toBeVisible();
    await expect(githubCard.locator('text=Development platform for version control')).toBeVisible();
    await expect(githubCard.locator('text=code')).toBeVisible();
    await expect(githubCard.locator('text=Development')).toBeVisible();
    await expect(githubCard.locator('text=45 visits')).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that page still loads correctly
    await expect(page.locator('h1')).toContainText('BookmarkHub');
    
    // Check that sidebar adapts to mobile
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
    
    // Check that bookmark grid adapts (should stack vertically)
    const bookmarkCards = page.locator('[data-testid="bookmark-card"]');
    await expect(bookmarkCards.first()).toBeVisible();
  });

  test('visual regression test - dashboard appearance', async ({ page }) => {
    // Wait for all content to load
    await page.waitForLoadState('networkidle');
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
    });
  });

  test('visual regression test - sidebar only', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of sidebar only
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toHaveScreenshot('sidebar.png');
  });

  test('accessibility - keyboard navigation', async ({ page }) => {
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab'); // Should focus first interactive element
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      await expect(currentFocus).toBeVisible();
    }
  });

  test('performance - page load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Expect page to load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('error handling - network failures', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);
    
    // Try to reload the page
    await page.reload();
    
    // Check for appropriate error handling
    // This will depend on how you implement offline handling
    // For now, just ensure the page doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('BookmarkHub Dark Theme', () => {
  test('dark theme is applied correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check that body has dark background
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should be a dark color (gray-900 or similar)
    expect(backgroundColor).toMatch(/rgb\(17,\s*24,\s*39\)|rgb\(15,\s*23,\s*42\)/);
  });
}); 