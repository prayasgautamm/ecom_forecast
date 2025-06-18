import { test, expect } from '@playwright/test';

test.describe('Minimal UI - Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forecast-working');
    // Wait for page to fully load
    await page.waitForSelector('text=Sales Forecast', { timeout: 10000 });
    // Wait for initial animations
    await page.waitForTimeout(1000);
  });

  test.describe('Header and Command Palette', () => {
    test('should display minimal header with logo and Cmd+K hint', async ({ page }) => {
      // Check header height is exactly 56px
      const header = page.locator('header').first();
      const headerBox = await header.boundingBox();
      expect(headerBox?.height).toBe(56);
      
      // Check logo
      await expect(page.locator('text=Sales Forecast')).toBeVisible();
      
      // Check Cmd+K hint
      await expect(page.locator('text=⌘K')).toBeVisible();
    });

    test('command palette should open with Cmd+K', async ({ page }) => {
      // Press Cmd+K (or Ctrl+K on non-Mac)
      await page.keyboard.press('Control+k');
      await page.waitForTimeout(500);
      
      // Check command palette is visible
      await expect(page.locator('[cmdk-root]')).toBeVisible();
      await expect(page.locator('input[placeholder="Type a command..."]')).toBeVisible();
      
      // Check command options
      await expect(page.locator('text=Select 6 LD')).toBeVisible();
      await expect(page.locator('text=Add New SKU')).toBeVisible();
      await expect(page.locator('text=Search SKUs')).toBeVisible();
      await expect(page.locator('text=View Analytics')).toBeVisible();
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(page.locator('[cmdk-root]')).not.toBeVisible();
    });

    test('command palette actions should work', async ({ page }) => {
      // Open command palette
      await page.keyboard.press('Control+k');
      await page.waitForTimeout(500);
      
      // Search for SKU
      await page.fill('input[placeholder="Type a command..."]', '6 LD');
      await page.waitForTimeout(300);
      
      // Select the SKU command
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Verify SKU is selected
      const checkbox = page.locator('input[type="checkbox"]').filter({ has: page.locator('..').filter({ hasText: '6 LD' }) });
      await expect(checkbox).toBeChecked();
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('sidebar should have icon navigation', async ({ page }) => {
      // Check sidebar icons
      await expect(page.locator('svg.lucide-trending-up')).toBeVisible();
      await expect(page.locator('svg.lucide-package')).toBeVisible();
      await expect(page.locator('svg.lucide-user')).toBeVisible();
      
      // Check active state (Forecast View should be active by default)
      const activeSection = page.locator('button').filter({ has: page.locator('svg.lucide-trending-up') }).first();
      await expect(activeSection).toHaveClass(/bg-primary/);
    });

    test('sidebar sections should switch correctly', async ({ page }) => {
      // Click SKU Management
      const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
      await skuButton.click();
      await page.waitForTimeout(500);
      
      // Check section changed
      await expect(page.locator('h2:has-text("SKU Management")')).toBeVisible();
      await expect(skuButton).toHaveClass(/bg-primary/);
      
      // Click back to Forecast View
      const forecastButton = page.locator('button').filter({ has: page.locator('svg.lucide-trending-up') }).first();
      await forecastButton.click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('h2:has-text("Forecast View")')).toBeVisible();
    });
  });

  test.describe('SKU Management Section', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to SKU Management
      const skuButton = page.locator('button').filter({ has: page.locator('svg.lucide-package') }).first();
      await skuButton.click();
      await page.waitForTimeout(500);
    });

    test('should display SKU list with minimal design', async ({ page }) => {
      // Check SKU cards
      await expect(page.locator('text=6 LD')).toBeVisible();
      await expect(page.locator('text=Electronics')).toBeVisible();
      
      // Check minimal card styling (no gradients)
      const skuCard = page.locator('.border').filter({ hasText: '6 LD' }).first();
      const cardStyles = await skuCard.evaluate(el => window.getComputedStyle(el));
      expect(cardStyles.backgroundImage).toBe('none');
    });

    test('add SKU dialog should work with new design', async ({ page }) => {
      // Click Add New button
      await page.locator('button:has-text("Add New")').click();
      await page.waitForTimeout(500);
      
      // Check dialog opened
      await expect(page.locator('h2:has-text("Add New SKU")')).toBeVisible();
      
      // Fill form
      await page.fill('input[placeholder="Enter SKU code"]', 'TEST-001');
      await page.fill('input[placeholder="Enter display name"]', 'Test SKU 001');
      await page.selectOption('select', 'Electronics');
      
      // Save
      await page.locator('button:has-text("Add SKU")').click();
      await page.waitForTimeout(500);
      
      // Check toast notification
      await expect(page.locator('text=SKU added successfully')).toBeVisible();
      
      // Verify new SKU appears
      await expect(page.locator('text=TEST-001')).toBeVisible();
    });

    test('edit SKU should show toast notification', async ({ page }) => {
      // Click edit button on first SKU
      const editButton = page.locator('button').filter({ has: page.locator('svg.lucide-edit2') }).first();
      await editButton.click();
      await page.waitForTimeout(500);
      
      // Check dialog
      await expect(page.locator('h2:has-text("Edit SKU")')).toBeVisible();
      
      // Modify display name
      const displayNameInput = page.locator('input[value="6 LD"]');
      await displayNameInput.clear();
      await displayNameInput.fill('6 LD Updated');
      
      // Save
      await page.locator('button:has-text("Update SKU")').click();
      await page.waitForTimeout(500);
      
      // Check toast
      await expect(page.locator('text=SKU updated successfully')).toBeVisible();
    });

    test('delete SKU should show confirmation and toast', async ({ page }) => {
      // Click delete button
      const deleteButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
      await deleteButton.click();
      await page.waitForTimeout(500);
      
      // Check confirmation dialog
      await expect(page.locator('text=Are you sure you want to delete')).toBeVisible();
      
      // Confirm deletion
      await page.locator('button:has-text("Delete")').filter({ hasText: 'Delete' }).last().click();
      await page.waitForTimeout(500);
      
      // Check toast
      await expect(page.locator('text=SKU deleted successfully')).toBeVisible();
    });
  });

  test.describe('Forecast View Section', () => {
    test('should show minimal SKU selection', async ({ page }) => {
      // Check search bar
      await expect(page.locator('input[placeholder="Search SKUs..."]')).toBeVisible();
      
      // Check minimal SKU selection items
      const skuItem = page.locator('.flex.items-center.justify-between').filter({ hasText: '6 LD' }).first();
      await expect(skuItem).toBeVisible();
      
      // Should only show name and checkbox (no extra info)
      const itemText = await skuItem.textContent();
      expect(itemText).not.toContain('Electronics');
      expect(itemText).not.toContain('units');
    });

    test('SKU selection should update charts', async ({ page }) => {
      // Select a SKU
      const checkbox = page.locator('input[type="checkbox"]').filter({ 
        has: page.locator('..').filter({ hasText: '6 LD' }) 
      });
      await checkbox.click();
      await page.waitForTimeout(1000);
      
      // Check Tremor charts are visible
      await expect(page.locator('.tremor-AreaChart-root').first()).toBeVisible();
      await expect(page.locator('text=Forecast Accuracy')).toBeVisible();
    });

    test('analytics view should show Tremor charts', async ({ page }) => {
      // Select SKUs first
      await page.locator('input[type="checkbox"]').first().click();
      await page.locator('input[type="checkbox"]').nth(1).click();
      await page.waitForTimeout(500);
      
      // Switch to Analytics tab
      await page.locator('button:has-text("Analytics")').click();
      await page.waitForTimeout(1000);
      
      // Check multiple chart types
      await expect(page.locator('.tremor-AreaChart-root')).toHaveCount(1);
      await expect(page.locator('.tremor-BarChart-root')).toHaveCount(1);
      await expect(page.locator('.tremor-DonutChart-root')).toHaveCount(1);
      
      // Check metrics
      await expect(page.locator('text=Total Forecast')).toBeVisible();
      await expect(page.locator('text=Average Accuracy')).toBeVisible();
    });
  });

  test.describe('Animations and Transitions', () => {
    test('page elements should animate on load', async ({ page }) => {
      // Reload page to see animations
      await page.reload();
      
      // Check for motion divs
      const animatedElements = page.locator('div[style*="opacity"]');
      const count = await animatedElements.count();
      expect(count).toBeGreaterThan(0);
      
      // Wait for animations to complete
      await page.waitForTimeout(1500);
      
      // Elements should be fully visible
      await expect(page.locator('h2:has-text("Forecast View")')).toBeVisible();
    });

    test('tab switches should animate smoothly', async ({ page }) => {
      // Select a SKU first
      await page.locator('input[type="checkbox"]').first().click();
      await page.waitForTimeout(500);
      
      // Switch tabs and observe animation
      const analyticsTab = page.locator('button:has-text("Analytics")');
      await analyticsTab.click();
      
      // Content should animate in
      await expect(page.locator('.tremor-AreaChart-root')).toBeVisible();
      
      // Switch back
      const detailsTab = page.locator('button:has-text("Details")');
      await detailsTab.click();
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should show 52 weeks with pagination controls', async ({ page }) => {
      // Select a SKU
      await page.locator('input[type="checkbox"]').first().click();
      await page.waitForTimeout(500);
      
      // Check pagination info
      await expect(page.locator('text=Showing weeks 1-10 of 52')).toBeVisible();
      
      // Check navigation buttons
      const prevButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') });
      const nextButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') });
      
      await expect(prevButton).toBeDisabled();
      await expect(nextButton).toBeEnabled();
      
      // Click next
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Check updated pagination
      await expect(page.locator('text=Showing weeks 11-20 of 52')).toBeVisible();
      await expect(prevButton).toBeEnabled();
    });

    test('should display correct week numbers W01-W52', async ({ page }) => {
      // Select a SKU
      await page.locator('input[type="checkbox"]').first().click();
      await page.waitForTimeout(500);
      
      // Check first page has W01-W10
      await expect(page.locator('text=W01')).toBeVisible();
      await expect(page.locator('text=W10')).toBeVisible();
      
      // Navigate to last page
      for (let i = 0; i < 5; i++) {
        const nextButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') });
        await nextButton.click();
        await page.waitForTimeout(300);
      }
      
      // Should show W51-W52
      await expect(page.locator('text=W51')).toBeVisible();
      await expect(page.locator('text=W52')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Header should still be visible
      await expect(page.locator('text=Sales Forecast')).toBeVisible();
      
      // Sidebar should be more compact
      const sidebar = page.locator('aside').first();
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox?.width).toBeLessThanOrEqual(80);
      
      // Cards should stack vertically
      const cards = page.locator('.border.rounded-lg');
      const firstCard = await cards.first().boundingBox();
      const secondCard = await cards.nth(1).boundingBox();
      
      if (firstCard && secondCard) {
        expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      // Check command palette accessibility
      await page.keyboard.press('Control+k');
      await page.waitForTimeout(500);
      
      const commandInput = page.locator('input[placeholder="Type a command..."]');
      const ariaLabel = await commandInput.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      
      await page.keyboard.press('Escape');
      
      // Check button accessibility
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const hasAriaLabel = await button.getAttribute('aria-label');
        const hasText = await button.textContent();
        expect(hasAriaLabel || hasText).toBeTruthy();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through interface
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Should focus on first interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Tab to command palette trigger
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
      
      // Enter should open command palette
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      await expect(page.locator('[cmdk-root]')).toBeVisible();
    });
  });
});