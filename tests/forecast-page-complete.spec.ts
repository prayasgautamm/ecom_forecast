import { test, expect } from '@playwright/test';

test.describe('Forecast Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forecast-working');
    // Wait for page to fully load
    await page.waitForSelector('h1:has-text("Sales Forecast")', { timeout: 10000 });
    // Wait for SKUs to load
    await page.waitForSelector('text=6 LD', { timeout: 10000 });
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
    // Wait for SKU cards to be visible
    await page.waitForSelector('text=6 LD', { timeout: 5000 });
    
    // Initially check which SKUs are selected by looking at checkboxes
    const initialCheckedCount = await page.locator('div.p-4 input[type="checkbox"]:checked').count();
    console.log(`Initially ${initialCheckedCount} SKUs are selected`);

    // Find the 6 ST card and click it
    const targetSku = '6 ST';
    const skuCard = page.locator(`div.cursor-pointer:has-text("${targetSku}")`).filter({ hasText: 'Electronics' });
    
    // Check if it's already selected
    const checkbox = skuCard.locator('input[type="checkbox"]');
    const wasChecked = await checkbox.isChecked();
    console.log(`${targetSku} was ${wasChecked ? 'checked' : 'unchecked'}`);
    
    // Click the card
    await skuCard.click();
    await page.waitForTimeout(500);
    
    // Verify the state changed
    const isCheckedNow = await checkbox.isChecked();
    expect(isCheckedNow).toBe(!wasChecked);
    
    // If it's now checked, verify it appears in the main content
    if (isCheckedNow) {
      await expect(page.locator(`div.glass:has-text("${targetSku}")`).first()).toBeVisible();
    }
  });

  test('SKU deselection should work', async ({ page }) => {
    // Find a selected SKU - let's make sure one is selected first
    const skuToSelect = '6 LD';
    const skuCard = page.locator(`div.cursor-pointer:has-text("${skuToSelect}")`).filter({ hasText: 'Electronics' });
    const checkbox = skuCard.locator('input[type="checkbox"]');
    
    // If not checked, check it first
    if (!(await checkbox.isChecked())) {
      await skuCard.click();
      await page.waitForTimeout(500);
    }
    
    // Now verify it's checked
    await expect(checkbox).toBeChecked();
    
    // Click to deselect
    await skuCard.click();
    await page.waitForTimeout(500);
    
    // Verify it's unchecked
    await expect(checkbox).not.toBeChecked();
    
    // Check if "No SKUs Selected" appears when all are deselected
    const allCheckboxes = await page.locator('div.p-4 input[type="checkbox"]:checked').count();
    if (allCheckboxes === 0) {
      await expect(page.locator('text=No SKUs Selected')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Checkbox selection should work', async ({ page }) => {
    // Find an unchecked SKU
    const targetSku = '3 LD - CS 008';
    const skuCard = page.locator(`div.cursor-pointer:has-text("${targetSku}")`).first();
    const checkbox = skuCard.locator('input[type="checkbox"]');
    
    // Make sure it's not checked
    if (await checkbox.isChecked()) {
      await checkbox.click();
      await page.waitForTimeout(500);
    }
    
    // Now click the checkbox directly
    await checkbox.click();
    await page.waitForTimeout(500);
    
    // Verify it's checked
    await expect(checkbox).toBeChecked();
    
    // Verify the SKU appears in the main content
    await expect(page.locator(`div.glass:has-text("${targetSku}")`).first()).toBeVisible();
  });

  test('Search functionality should filter SKUs', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search SKUs..."]');
    
    // Count initial SKU cards
    const initialCount = await page.locator('div.cursor-pointer').filter({ has: page.locator('input[type="checkbox"]') }).count();
    console.log(`Initial SKU count: ${initialCount}`);
    
    // Type in search
    await searchInput.fill('CDS');
    await page.waitForTimeout(1000);
    
    // Count filtered SKUs - look for cards containing "CDS"
    const filteredCount = await page.locator('div.cursor-pointer:has-text("CDS")').filter({ has: page.locator('input[type="checkbox"]') }).count();
    console.log(`Filtered SKU count: ${filteredCount}`);
    
    // Should have some CDS items
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(initialCount);
    
    // Verify CDS items are visible
    await expect(page.locator('text=CDS-001')).toBeVisible();
    await expect(page.locator('text=CDS-002')).toBeVisible();
    
    // Verify non-CDS items are not visible
    await expect(page.locator('div.cursor-pointer:has-text("6 LD")')).not.toBeVisible();
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);
    
    // All SKUs should be visible again
    const afterClearCount = await page.locator('div.cursor-pointer').filter({ has: page.locator('input[type="checkbox"]') }).count();
    expect(afterClearCount).toBe(initialCount);
  });

  test('Table expansion/collapse should work', async ({ page }) => {
    // First select an SKU to see tables
    const skuCard = page.locator('div.cursor-pointer:has-text("6 LD")').filter({ hasText: 'Electronics' });
    const checkbox = skuCard.locator('input[type="checkbox"]');
    
    if (!(await checkbox.isChecked())) {
      await skuCard.click();
      await page.waitForTimeout(1000);
    }
    
    // Make sure we're in detailed view
    const detailedViewBtn = page.locator('button:has-text("Detailed View")');
    await detailedViewBtn.click();
    await page.waitForTimeout(1000);
    
    // Find the collapsible trigger for the forecast table
    const collapsibleTrigger = page.locator('[data-state]').filter({ hasText: 'Weekly sales forecast' }).first();
    
    // Get initial state
    const initialState = await collapsibleTrigger.getAttribute('data-state');
    console.log(`Initial state: ${initialState}`);
    
    // Click to toggle
    await collapsibleTrigger.click();
    await page.waitForTimeout(1000);
    
    // Check if state changed
    const newState = await collapsibleTrigger.getAttribute('data-state');
    expect(newState).not.toBe(initialState);
    
    // If opened, table should be visible
    if (newState === 'open') {
      await expect(page.locator('table').first()).toBeVisible();
    } else {
      await expect(page.locator('table').first()).not.toBeVisible();
    }
  });

  test('Edit/Delete menu should open and work', async ({ page }) => {
    // Set up dialog handlers
    let editDialogShown = false;
    let deleteDialogShown = false;
    
    page.on('dialog', async dialog => {
      console.log(`Dialog type: ${dialog.type()}, message: ${dialog.message()}`);
      if (dialog.message().includes('Edit functionality')) {
        editDialogShown = true;
        await dialog.accept();
      } else if (dialog.message().includes('Are you sure')) {
        deleteDialogShown = true;
        await dialog.dismiss();
      }
    });
    
    // Find a more button (three dots) - it's inside the SKU cards
    await page.waitForSelector('svg.lucide-more-vertical', { timeout: 5000 });
    const moreButton = page.locator('button:has(svg.lucide-more-vertical)').first();
    
    // Click to open menu
    await moreButton.click();
    await page.waitForTimeout(500);
    
    // Look for menu items
    const editMenuItem = page.locator('[role="menuitem"]:has-text("Edit SKU")');
    await expect(editMenuItem).toBeVisible();
    
    // Click Edit
    await editMenuItem.click();
    await page.waitForTimeout(1000);
    
    // Verify edit dialog was shown
    expect(editDialogShown).toBe(true);
    
    // Open menu again for delete test
    await moreButton.click();
    await page.waitForTimeout(500);
    
    const deleteMenuItem = page.locator('[role="menuitem"]:has-text("Delete SKU")');
    await deleteMenuItem.click();
    await page.waitForTimeout(1000);
    
    // Verify delete dialog was shown
    expect(deleteDialogShown).toBe(true);
  });

  test('Tabs switching should work', async ({ page }) => {
    // First make sure we have some SKUs selected
    const skuCard = page.locator('div.cursor-pointer:has-text("6 LD")').filter({ hasText: 'Electronics' });
    const checkbox = skuCard.locator('input[type="checkbox"]');
    
    if (!(await checkbox.isChecked())) {
      await skuCard.click();
      await page.waitForTimeout(1000);
    }
    
    // Click on Analytics View tab
    const analyticsTab = page.locator('button:has-text("Analytics View")');
    await analyticsTab.click();
    await page.waitForTimeout(2000); // Give charts time to render
    
    // Should see chart container
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
    
    // Switch back to Detailed View
    const detailedTab = page.locator('button:has-text("Detailed View")');
    await detailedTab.click();
    await page.waitForTimeout(1000);
    
    // Should see content related to detailed view
    await expect(page.locator('text=Weekly sales forecast').first()).toBeVisible();
  });

  test('Select all functionality should work', async ({ page }) => {
    // Find the select all checkbox - it's in the bulk actions area
    const selectAllContainer = page.locator('div.px-4.py-3').filter({ hasText: 'Select all' });
    const selectAllCheckbox = selectAllContainer.locator('input[type="checkbox"]');
    
    // Click select all
    await selectAllCheckbox.click();
    await page.waitForTimeout(1000);
    
    // Verify text changed to show selection count
    await expect(page.locator('text=/\\d+ selected/')).toBeVisible();
    
    // Count checked SKU checkboxes (not including select all)
    const checkedSkus = await page.locator('div.p-4 input[type="checkbox"]:checked').count();
    expect(checkedSkus).toBe(6); // All 6 SKUs should be checked
    
    // Clear button should be visible
    const clearButton = page.locator('button:has-text("Clear")');
    await expect(clearButton).toBeVisible();
    
    // Click clear
    await clearButton.click();
    await page.waitForTimeout(1000);
    
    // Verify all checkboxes are unchecked
    const uncheckedCount = await page.locator('div.p-4 input[type="checkbox"]:checked').count();
    expect(uncheckedCount).toBe(0);
    
    // Select all checkbox should also be unchecked
    await expect(selectAllCheckbox).not.toBeChecked();
  });

  test('Add SKU button should show alert', async ({ page }) => {
    // Set up dialog handler
    let dialogShown = false;
    page.on('dialog', async dialog => {
      console.log(`Add SKU dialog: ${dialog.message()}`);
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