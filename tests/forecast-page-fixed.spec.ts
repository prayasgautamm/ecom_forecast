import { test, expect } from '@playwright/test';

test.describe('Forecast Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forecast-working');
    // Wait for page to fully load
    await page.waitForSelector('h1:has-text("Sales Forecast")', { timeout: 10000 });
    await page.waitForTimeout(1000); // Additional wait for React state to settle
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
    // Wait for initial state to load
    await page.waitForTimeout(1000);
    
    // Initially one SKU should be selected (6LD)
    const selectedCheckboxes = await page.locator('input[type="checkbox"]:checked').count();
    expect(selectedCheckboxes).toBeGreaterThan(0);

    // Find and click on a non-selected SKU
    const skuToSelect = '6 ST';
    const skuCard = page.locator(`div.cursor-pointer:has-text("${skuToSelect}")`).first();
    
    // Check if it's not already selected
    const isSelected = await skuCard.locator('input[type="checkbox"]').isChecked();
    
    if (!isSelected) {
      await skuCard.click();
      await page.waitForTimeout(1000); // Wait for state update
      
      // Verify the checkbox is now checked
      await expect(skuCard.locator('input[type="checkbox"]')).toBeChecked();
      
      // The main content should show the selected SKU
      await expect(page.locator(`div.glass:has-text("${skuToSelect}")`)).toBeVisible();
    }
  });

  test('SKU deselection should work', async ({ page }) => {
    // Wait for initial state
    await page.waitForTimeout(1000);
    
    // Find the selected SKU (6LD)
    const selectedSku = '6 LD';
    const selectedCard = page.locator(`div.cursor-pointer:has-text("${selectedSku}")`).first();
    
    // Verify it's selected
    await expect(selectedCard.locator('input[type="checkbox"]')).toBeChecked();
    
    // Click to deselect
    await selectedCard.click();
    await page.waitForTimeout(1000);
    
    // Check if it's deselected
    await expect(selectedCard.locator('input[type="checkbox"]')).not.toBeChecked();
    
    // If no other SKUs are selected, should show "No SKUs Selected"
    const checkedCount = await page.locator('input[type="checkbox"]:checked').count();
    if (checkedCount === 0) {
      await expect(page.locator('text=No SKUs Selected')).toBeVisible();
    }
  });

  test('Checkbox selection should work', async ({ page }) => {
    // Wait for initial state
    await page.waitForTimeout(1000);
    
    // Find an unchecked SKU
    const targetSku = '3 LD - CS 008';
    const skuCard = page.locator(`div.cursor-pointer:has-text("${targetSku}")`).first();
    const checkbox = skuCard.locator('input[type="checkbox"]');
    
    // Check if it's not already checked
    const isChecked = await checkbox.isChecked();
    
    if (!isChecked) {
      // Click the checkbox directly
      await checkbox.click({ force: true });
      await page.waitForTimeout(1000);
      
      // Verify it's checked
      await expect(checkbox).toBeChecked();
      
      // Verify the SKU appears in the main content
      await expect(page.locator(`div.glass:has-text("${targetSku}")`)).toBeVisible();
    }
  });

  test('Search functionality should filter SKUs', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search SKUs..."]');
    
    // Type in search
    await searchInput.fill('CDS');
    await page.waitForTimeout(1000); // Wait for filtering
    
    // Check that CDS SKUs are visible
    const cdsCards = page.locator('div.cursor-pointer:has-text("CDS")');
    const visibleCdsCount = await cdsCards.count();
    expect(visibleCdsCount).toBeGreaterThan(0);
    
    // Check that non-CDS SKUs are not visible
    // Look for all SKU cards and filter
    const allCards = page.locator('div.cursor-pointer').filter({ has: page.locator('input[type="checkbox"]') });
    const allCount = await allCards.count();
    
    // Verify filtering is working (should have fewer cards visible)
    expect(visibleCdsCount).toBeLessThan(6); // Total SKUs is 6
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);
    
    // All SKUs should be visible again
    const allCardsAfterClear = await page.locator('div.cursor-pointer').filter({ has: page.locator('input[type="checkbox"]') }).count();
    expect(allCardsAfterClear).toBe(6);
  });

  test('Table expansion/collapse should work', async ({ page }) => {
    // Make sure we're in detailed view
    const detailedViewBtn = page.locator('button:has-text("Detailed View")');
    await detailedViewBtn.click();
    await page.waitForTimeout(1000);
    
    // Find a table card header (the collapsible trigger)
    const tableHeader = page.locator('div.cursor-pointer').filter({ hasText: 'Weekly sales forecast' }).first();
    
    // Click to expand
    await tableHeader.click();
    await page.waitForTimeout(1000);
    
    // Table should now be visible
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    
    // Click again to collapse
    await tableHeader.click();
    await page.waitForTimeout(1000);
    
    // Table should be hidden
    await expect(table).not.toBeVisible();
  });

  test('Edit/Delete menu should open and work', async ({ page }) => {
    // Set up dialog handlers before clicking
    let editDialogShown = false;
    let deleteDialogShown = false;
    
    page.on('dialog', async dialog => {
      if (dialog.message().includes('Edit functionality')) {
        editDialogShown = true;
        await dialog.accept();
      } else if (dialog.type() === 'confirm') {
        deleteDialogShown = true;
        await dialog.dismiss();
      }
    });
    
    // Find the three dots menu button
    const menuButton = page.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first();
    await menuButton.click();
    await page.waitForTimeout(500);
    
    // Menu should be visible - look for dropdown menu items
    const editOption = page.locator('div[role="menuitem"]:has-text("Edit SKU")');
    await expect(editOption).toBeVisible();
    
    // Click Edit
    await editOption.click();
    await page.waitForTimeout(1000);
    
    // Verify edit dialog was shown
    expect(editDialogShown).toBe(true);
    
    // Open menu again for delete test
    await menuButton.click();
    await page.waitForTimeout(500);
    
    const deleteOption = page.locator('div[role="menuitem"]:has-text("Delete SKU")');
    await deleteOption.click();
    await page.waitForTimeout(1000);
    
    // Verify delete dialog was shown
    expect(deleteDialogShown).toBe(true);
  });

  test('Tabs switching should work', async ({ page }) => {
    // Click on Analytics View tab
    const analyticsTab = page.locator('button:has-text("Analytics View")');
    await analyticsTab.click();
    await page.waitForTimeout(2000); // Give charts time to render
    
    // Should see chart container - look for Recharts elements
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
    
    // Switch back to Detailed View
    const detailedTab = page.locator('button:has-text("Detailed View")');
    await detailedTab.click();
    await page.waitForTimeout(1000);
    
    // Should see table cards again
    const tableCards = page.locator('div.glass:has-text("Weekly sales forecast")');
    const tableCardCount = await tableCards.count();
    expect(tableCardCount).toBeGreaterThan(0);
  });

  test('Select all functionality should work', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // Find the select all checkbox in the header
    const selectAllCheckbox = page.locator('div.px-4.py-3').locator('input[type="checkbox"]').first();
    
    // Click select all
    await selectAllCheckbox.click({ force: true });
    await page.waitForTimeout(1000);
    
    // Count checked checkboxes (excluding the select all checkbox)
    const skuCheckboxes = page.locator('div.cursor-pointer input[type="checkbox"]:checked');
    const checkedCount = await skuCheckboxes.count();
    expect(checkedCount).toBe(6); // All 6 SKUs should be checked
    
    // Clear button should be visible
    const clearButton = page.locator('button:has-text("Clear")');
    await expect(clearButton).toBeVisible();
    
    // Click clear
    await clearButton.click();
    await page.waitForTimeout(1000);
    
    // No SKU checkboxes should be checked
    const uncheckedCount = await page.locator('div.cursor-pointer input[type="checkbox"]:checked').count();
    expect(uncheckedCount).toBe(0);
  });

  test('Add SKU button should show alert', async ({ page }) => {
    // Set up dialog handler
    let dialogShown = false;
    page.on('dialog', async dialog => {
      if (dialog.message().includes('Add SKU functionality')) {
        dialogShown = true;
        await dialog.accept();
      }
    });
    
    // Click Add SKU button
    const addButton = page.locator('button:has-text("Add SKU")');
    await addButton.click();
    await page.waitForTimeout(1000);
    
    // Verify dialog was shown
    expect(dialogShown).toBe(true);
  });
});