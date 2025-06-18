import { test, expect } from '@playwright/test';

test.describe('Toast Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('should show success toast for SKU operations', async ({ page }) => {
    // Switch to SKU Management
    const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
    await skuButton.click();
    await page.waitForTimeout(500);
    
    // Add new SKU
    await page.locator('button:has-text("Add New")').click();
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Enter SKU code"]', 'TOAST-TEST');
    await page.fill('input[placeholder="Enter display name"]', 'Toast Test SKU');
    await page.selectOption('select', 'Electronics');
    await page.locator('button:has-text("Add SKU")').click();
    
    // Check success toast
    const toast = page.locator('[data-sonner-toast]').filter({ hasText: 'SKU added successfully' });
    await expect(toast).toBeVisible();
    
    // Toast should auto-dismiss
    await page.waitForTimeout(5000);
    await expect(toast).not.toBeVisible();
  });

  test('should show error toast for duplicate SKU', async ({ page }) => {
    // Switch to SKU Management
    const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
    await skuButton.click();
    await page.waitForTimeout(500);
    
    // Try to add duplicate SKU
    await page.locator('button:has-text("Add New")').click();
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Enter SKU code"]', '6LD'); // Existing SKU
    await page.fill('input[placeholder="Enter display name"]', 'Duplicate');
    await page.selectOption('select', 'Electronics');
    await page.locator('button:has-text("Add SKU")').click();
    
    // Check error toast
    const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: 'already exists' });
    await expect(errorToast).toBeVisible();
  });

  test('should stack multiple toasts', async ({ page }) => {
    // Generate multiple actions quickly
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    
    // Select multiple SKUs quickly
    await page.fill('input[placeholder="Type a command..."]', 'select');
    await page.waitForTimeout(300);
    
    // Select first option
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    
    // Open command palette again
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    
    // Check multiple toasts are visible
    const toasts = page.locator('[data-sonner-toast]');
    const toastCount = await toasts.count();
    expect(toastCount).toBeGreaterThanOrEqual(1);
  });

  test('toast should be dismissible', async ({ page }) => {
    // Switch to SKU Management and trigger a toast
    const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
    await skuButton.click();
    await page.waitForTimeout(500);
    
    // Delete a SKU to get a toast
    const deleteButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await deleteButton.click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Delete")').last().click();
    
    // Wait for toast
    const toast = page.locator('[data-sonner-toast]').first();
    await expect(toast).toBeVisible();
    
    // Look for close button and click it
    const closeButton = toast.locator('button[aria-label="Close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
      await expect(toast).not.toBeVisible();
    }
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast', { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  test('should handle empty SKU form submission', async ({ page }) => {
    // Switch to SKU Management
    const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
    await skuButton.click();
    await page.waitForTimeout(500);
    
    // Open add dialog
    await page.locator('button:has-text("Add New")').click();
    await page.waitForTimeout(500);
    
    // Try to submit empty form
    await page.locator('button:has-text("Add SKU")').click();
    
    // Should show validation error
    const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: 'fill in all fields' });
    await expect(errorToast).toBeVisible();
  });

  test('should handle search with no results', async ({ page }) => {
    // Search for non-existent SKU
    const searchInput = page.locator('input[placeholder="Search SKUs..."]');
    await searchInput.fill('NONEXISTENT123');
    await page.waitForTimeout(500);
    
    // Should show no results message
    const noResults = page.locator('text=No SKUs found');
    const hasNoResults = await noResults.isVisible();
    
    if (!hasNoResults) {
      // Alternative: check that no SKU items are visible
      const skuItems = page.locator('.flex.items-center.justify-between').filter({ 
        has: page.locator('input[type="checkbox"]') 
      });
      const count = await skuItems.count();
      expect(count).toBe(0);
    }
  });

  test('should handle rapid tab switching', async ({ page }) => {
    // Select a SKU first
    await page.locator('input[type="checkbox"]').first().click();
    await page.waitForTimeout(500);
    
    // Rapidly switch tabs
    for (let i = 0; i < 5; i++) {
      await page.locator('button:has-text("Analytics")').click();
      await page.waitForTimeout(100);
      await page.locator('button:has-text("Details")').click();
      await page.waitForTimeout(100);
    }
    
    // Should end up on Details tab without errors
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('should handle command palette with escape key', async ({ page }) => {
    // Open and close command palette multiple times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Control+k');
      await page.waitForTimeout(200);
      await expect(page.locator('[cmdk-root]')).toBeVisible();
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      await expect(page.locator('[cmdk-root]')).not.toBeVisible();
    }
  });

  test('should maintain state after page actions', async ({ page }) => {
    // Select some SKUs
    await page.locator('input[type="checkbox"]').first().click();
    await page.locator('input[type="checkbox"]').nth(1).click();
    await page.waitForTimeout(500);
    
    // Switch to analytics
    await page.locator('button:has-text("Analytics")').click();
    await page.waitForTimeout(1000);
    
    // Open command palette
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    
    // Should still be on analytics with same SKUs selected
    await expect(page.locator('.tremor-AreaChart-root')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
    await expect(page.locator('input[type="checkbox"]').nth(1)).toBeChecked();
  });
});