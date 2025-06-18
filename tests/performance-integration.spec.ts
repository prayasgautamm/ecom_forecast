import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check core web vitals
    const metrics = await page.evaluate(() => {
      return JSON.stringify({
        FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
      });
    });
    
    console.log('Performance metrics:', metrics);
  });

  test('animations should not block interactions', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    // Immediately try to interact during animations
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.click();
    
    // Should be able to interact even during animations
    await expect(checkbox).toBeChecked();
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    // Select all SKUs
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    const startTime = Date.now();
    
    // Select all checkboxes
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).click();
      await page.waitForTimeout(50);
    }
    
    const selectionTime = Date.now() - startTime;
    
    // Should handle multiple selections efficiently
    expect(selectionTime).toBeLessThan(count * 200); // Less than 200ms per selection
    
    // Charts should still render
    await page.locator('button:has-text("Analytics")').click();
    await expect(page.locator('.tremor-AreaChart-root')).toBeVisible({ timeout: 5000 });
  });

  test('pagination should be performant', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    // Select a SKU
    await page.locator('input[type="checkbox"]').first().click();
    await page.waitForTimeout(500);
    
    const nextButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') });
    
    // Navigate through all pages quickly
    const startTime = Date.now();
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
      await page.waitForTimeout(100);
    }
    const navigationTime = Date.now() - startTime;
    
    // Should navigate quickly
    expect(navigationTime).toBeLessThan(2000);
    
    // Should be on page 6
    await expect(page.locator('text=Showing weeks 51-52 of 52')).toBeVisible();
  });
});

test.describe('Integration Tests', () => {
  test('full workflow: add SKU, select, view analytics', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    // Step 1: Switch to SKU Management
    const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
    await skuButton.click();
    await page.waitForTimeout(500);
    
    // Step 2: Add new SKU
    await page.locator('button:has-text("Add New")').click();
    await page.waitForTimeout(500);
    
    const newSkuCode = `INT-${Date.now()}`;
    await page.fill('input[placeholder="Enter SKU code"]', newSkuCode);
    await page.fill('input[placeholder="Enter display name"]', 'Integration Test SKU');
    await page.selectOption('select', 'Electronics');
    await page.locator('button:has-text("Add SKU")').click();
    await page.waitForTimeout(500);
    
    // Verify toast
    await expect(page.locator('text=SKU added successfully')).toBeVisible();
    
    // Step 3: Switch back to Forecast View
    const forecastButton = page.locator('button').filter({ has: page.locator('svg.lucide-trending-up') }).first();
    await forecastButton.click();
    await page.waitForTimeout(500);
    
    // Step 4: Search and select the new SKU
    await page.fill('input[placeholder="Search SKUs..."]', newSkuCode);
    await page.waitForTimeout(500);
    
    const newSkuCheckbox = page.locator('input[type="checkbox"]').filter({
      has: page.locator('..').filter({ hasText: 'Integration Test SKU' })
    });
    await newSkuCheckbox.click();
    await page.waitForTimeout(500);
    
    // Step 5: View analytics
    await page.locator('button:has-text("Analytics")').click();
    await page.waitForTimeout(1000);
    
    // Verify charts are displayed
    await expect(page.locator('.tremor-AreaChart-root')).toBeVisible();
    await expect(page.locator('text=Integration Test SKU')).toBeVisible();
    
    // Step 6: Clean up - delete the SKU
    await skuButton.click();
    await page.waitForTimeout(500);
    
    const deleteButton = page.locator('tr').filter({ hasText: newSkuCode }).locator('button').filter({ has: page.locator('svg.lucide-trash2') });
    await deleteButton.click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Delete")').last().click();
    
    // Verify deletion
    await expect(page.locator('text=SKU deleted successfully')).toBeVisible();
  });

  test('command palette integration with all features', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    // Test 1: Use command palette to add SKU
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="Type a command..."]', 'add');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Should open add dialog
    await expect(page.locator('h2:has-text("Add New SKU")')).toBeVisible();
    await page.keyboard.press('Escape');
    
    // Test 2: Use command palette to select SKU
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="Type a command..."]', '6 LD');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    
    // Verify selection
    const checkbox = page.locator('input[type="checkbox"]').filter({
      has: page.locator('..').filter({ hasText: '6 LD' })
    });
    await expect(checkbox).toBeChecked();
    
    // Test 3: Use command palette to view analytics
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="Type a command..."]', 'analytics');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    
    // Should switch to analytics view
    await expect(page.locator('.tremor-AreaChart-root')).toBeVisible();
  });

  test('state persistence across section switches', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    // Select some SKUs
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await checkboxes.nth(2).click();
    await page.waitForTimeout(500);
    
    // Switch to Analytics
    await page.locator('button:has-text("Analytics")').click();
    await page.waitForTimeout(1000);
    
    // Switch to SKU Management
    const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
    await skuButton.click();
    await page.waitForTimeout(500);
    
    // Switch back to Forecast View
    const forecastButton = page.locator('button').filter({ has: page.locator('svg.lucide-trending-up') }).first();
    await forecastButton.click();
    await page.waitForTimeout(500);
    
    // Verify selections are maintained
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).toBeChecked();
    
    // Verify we're still on Analytics tab
    await expect(page.locator('.tremor-AreaChart-root')).toBeVisible();
  });

  test('concurrent operations handling', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('text=Sales Forecast');
    
    // Start multiple operations concurrently
    const operations = [
      // Select SKUs
      page.locator('input[type="checkbox"]').nth(0).click(),
      page.locator('input[type="checkbox"]').nth(1).click(),
      
      // Open command palette
      page.keyboard.press('Control+k'),
      
      // Search
      page.fill('input[placeholder="Search SKUs..."]', 'test'),
    ];
    
    // Execute all operations
    await Promise.all(operations.map(op => op.catch(e => console.log('Operation failed:', e))));
    
    await page.waitForTimeout(1000);
    
    // Close command palette if open
    const commandPalette = page.locator('[cmdk-root]');
    if (await commandPalette.isVisible()) {
      await page.keyboard.press('Escape');
    }
    
    // Verify state is consistent
    await expect(page.locator('input[type="checkbox"]').nth(0)).toBeChecked();
    await expect(page.locator('input[type="checkbox"]').nth(1)).toBeChecked();
  });
});