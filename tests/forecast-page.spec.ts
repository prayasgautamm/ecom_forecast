import { test, expect } from '@playwright/test';

test.describe('Forecast Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forecast-working');
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Sales Forecast")');
  });

  test('should load the page with header and sidebar', async ({ page }) => {
    // Check header
    await expect(page.locator('h1:has-text("Sales Forecast")')).toBeVisible();
    await expect(page.locator('text=Real-time inventory analytics')).toBeVisible();
    
    // Check sidebar
    await expect(page.locator('h2:has-text("SKUs")')).toBeVisible();
    await expect(page.locator('input[placeholder="Search SKUs..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Add SKU")')).toBeVisible();
  });

  test('SKU selection should work', async ({ page }) => {
    // Initially one SKU should be selected (6LD)
    const selectedCheckboxes = await page.locator('input[type="checkbox"]:checked').count();
    expect(selectedCheckboxes).toBeGreaterThan(0);

    // Click on a non-selected SKU card
    const skuCard = page.locator('.cursor-pointer:has-text("6 ST")').first();
    await skuCard.click();
    
    // Wait a bit for state update
    await page.waitForTimeout(500);
    
    // Check if the SKU is now selected (has ring-2 class)
    const selectedCard = await page.locator('.ring-2.ring-blue-500:has-text("6 ST")').count();
    expect(selectedCard).toBe(1);
    
    // The main content should show the selected SKU
    await expect(page.locator('.glass:has-text("6 ST")')).toBeVisible();
  });

  test('SKU deselection should work', async ({ page }) => {
    // Click on the already selected SKU (6LD) to deselect it
    const selectedCard = page.locator('.ring-2.ring-blue-500:has-text("6 LD")').first();
    await selectedCard.click();
    
    // Wait for state update
    await page.waitForTimeout(500);
    
    // Check if no SKUs are selected
    const noSkusMessage = await page.locator('text=No SKUs Selected').isVisible();
    expect(noSkusMessage).toBe(true);
  });

  test('Checkbox selection should work', async ({ page }) => {
    // Find a checkbox that's not checked
    const uncheckedSku = page.locator('.cursor-pointer:has-text("3 LD - CS 008")').first();
    const checkbox = uncheckedSku.locator('input[type="checkbox"]');
    
    // Click the checkbox
    await checkbox.click();
    
    // Wait for state update
    await page.waitForTimeout(500);
    
    // Verify it's checked
    await expect(checkbox).toBeChecked();
    
    // Verify the SKU appears in the main content
    await expect(page.locator('.glass:has-text("3 LD - CS 008")')).toBeVisible();
  });

  test('Search functionality should filter SKUs', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search SKUs..."]');
    
    // Type in search
    await searchInput.fill('CDS');
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Check that only CDS SKUs are visible
    const visibleSkus = await page.locator('.cursor-pointer:has-text("CDS")').count();
    expect(visibleSkus).toBe(2); // CDS-001 and CDS-002
    
    // Check that non-CDS SKUs are not visible
    const nonCdsSkus = await page.locator('.cursor-pointer:has-text("6 LD")').count();
    expect(nonCdsSkus).toBe(0);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // All SKUs should be visible again
    const allSkus = await page.locator('.cursor-pointer[class*="Card"]').count();
    expect(allSkus).toBe(6);
  });

  test('Table expansion/collapse should work', async ({ page }) => {
    // Make sure we're in detailed view
    await page.locator('button:has-text("Detailed View")').click();
    
    // Find the first table card header
    const tableHeader = page.locator('.cursor-pointer.hover\\:bg-white\\/50').first();
    
    // Initially, table should be collapsed (no table visible)
    let tableVisible = await page.locator('table').first().isVisible();
    expect(tableVisible).toBe(false);
    
    // Click to expand
    await tableHeader.click();
    await page.waitForTimeout(500);
    
    // Table should now be visible
    tableVisible = await page.locator('table').first().isVisible();
    expect(tableVisible).toBe(true);
    
    // Click again to collapse
    await tableHeader.click();
    await page.waitForTimeout(500);
    
    // Table should be hidden again
    tableVisible = await page.locator('table').first().isVisible();
    expect(tableVisible).toBe(false);
  });

  test('Edit/Delete menu should open and work', async ({ page }) => {
    // Find the three dots menu button
    const menuButton = page.locator('button:has(svg.MoreVertical)').first();
    await menuButton.click();
    
    // Menu should be visible
    await expect(page.locator('text=Edit SKU')).toBeVisible();
    await expect(page.locator('text=Delete SKU')).toBeVisible();
    
    // Test Edit
    await page.locator('text=Edit SKU').click();
    
    // Should show alert (mock implementation)
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Edit functionality');
      dialog.accept();
    });
    
    // Test Delete
    await menuButton.click(); // Open menu again
    await page.locator('text=Delete SKU').click();
    
    // Should show confirm dialog
    page.on('dialog', dialog => {
      expect(dialog.type()).toBe('confirm');
      dialog.dismiss(); // Cancel
    });
  });

  test('Tabs switching should work', async ({ page }) => {
    // Click on Analytics View tab
    await page.locator('button:has-text("Analytics View")').click();
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Should see chart container
    const chartContainer = await page.locator('.recharts-wrapper').first().isVisible();
    expect(chartContainer).toBe(true);
    
    // Switch back to Detailed View
    await page.locator('button:has-text("Detailed View")').click();
    await page.waitForTimeout(500);
    
    // Should see table cards again
    const tableCards = await page.locator('.glass:has-text("Weekly sales forecast")').count();
    expect(tableCards).toBeGreaterThan(0);
  });

  test('Select all functionality should work', async ({ page }) => {
    // Click select all checkbox
    const selectAllCheckbox = page.locator('.px-4.py-3 input[type="checkbox"]').first();
    await selectAllCheckbox.click();
    
    // Wait for state update
    await page.waitForTimeout(500);
    
    // All checkboxes should be checked
    const checkedCount = await page.locator('input[type="checkbox"]:checked').count();
    expect(checkedCount).toBe(7); // 6 SKUs + select all checkbox
    
    // Clear button should be visible
    await expect(page.locator('button:has-text("Clear")')).toBeVisible();
    
    // Click clear
    await page.locator('button:has-text("Clear")').click();
    await page.waitForTimeout(500);
    
    // No checkboxes should be checked
    const uncheckedCount = await page.locator('input[type="checkbox"]:checked').count();
    expect(uncheckedCount).toBe(0);
  });

  test('Add SKU button should show alert', async ({ page }) => {
    // Set up dialog handler
    let dialogShown = false;
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Add SKU functionality');
      dialogShown = true;
      dialog.accept();
    });
    
    // Click Add SKU button
    await page.locator('button:has-text("Add SKU")').click();
    
    // Wait a bit
    await page.waitForTimeout(500);
    
    // Verify dialog was shown
    expect(dialogShown).toBe(true);
  });
});