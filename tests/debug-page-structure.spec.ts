import { test } from '@playwright/test';

test.describe('Debug Page Structure', () => {
  test('Log all interactive elements', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForTimeout(3000); // Wait for full page load

    console.log('\n=== PAGE STRUCTURE DEBUG ===\n');

    // Log all checkboxes
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    console.log(`Found ${checkboxes.length} checkboxes`);
    for (let i = 0; i < checkboxes.length; i++) {
      const parent = await checkboxes[i].locator('..').locator('..').textContent();
      const isChecked = await checkboxes[i].isChecked();
      console.log(`Checkbox ${i}: ${isChecked ? 'CHECKED' : 'unchecked'} - Parent text: ${parent?.substring(0, 50)}...`);
    }

    console.log('\n--- SKU Cards ---');
    // Log all divs that might be SKU cards
    const cards = await page.locator('div.glass').all();
    console.log(`Found ${cards.length} glass divs`);

    // Look for cursor-pointer divs
    const clickableCards = await page.locator('div.cursor-pointer').all();
    console.log(`\nFound ${clickableCards.length} cursor-pointer divs`);
    for (let i = 0; i < Math.min(10, clickableCards.length); i++) {
      const text = await clickableCards[i].textContent();
      console.log(`Clickable ${i}: ${text?.substring(0, 100)}...`);
    }

    console.log('\n--- Buttons ---');
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`Button ${i}: ${isVisible ? 'visible' : 'hidden'} - "${text}"`);
    }

    console.log('\n--- Dropdown Menus ---');
    // Look for more-vertical icons
    const moreButtons = await page.locator('svg.lucide-more-vertical').all();
    console.log(`Found ${moreButtons.length} more-vertical icons`);

    // Try clicking first more button to see menu structure
    if (moreButtons.length > 0) {
      const firstMoreButton = await moreButtons[0].locator('..').first();
      await firstMoreButton.click();
      await page.waitForTimeout(500);

      // Look for menu items
      const menuItems = await page.locator('[role="menuitem"]').all();
      console.log(`\nFound ${menuItems.length} menu items after clicking more button`);
      for (let i = 0; i < menuItems.length; i++) {
        const text = await menuItems[i].textContent();
        console.log(`Menu item ${i}: "${text}"`);
      }
    }

    console.log('\n--- Select All Structure ---');
    const selectAllArea = await page.locator('div.px-4.py-3').first();
    const selectAllText = await selectAllArea.textContent();
    console.log(`Select all area text: ${selectAllText}`);

    console.log('\n=== END DEBUG ===\n');
  });
});