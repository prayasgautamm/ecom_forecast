import { test, expect } from '@playwright/test';

test.describe('Debug Forecast Page Issues', () => {
  test('Check if page loads and log elements', async ({ page }) => {
    // Navigate to the page
    await page.goto('/forecast-working');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Log all clickable elements
    console.log('\n=== CLICKABLE ELEMENTS ===');
    const clickableElements = await page.locator('button, [role="button"], .cursor-pointer').all();
    for (const element of clickableElements) {
      const text = await element.textContent();
      const classes = await element.getAttribute('class');
      if (text?.trim()) {
        console.log(`- "${text.trim()}" (classes: ${classes})`);
      }
    }
    
    // Check SKU cards
    console.log('\n=== SKU CARDS ===');
    const skuCards = await page.locator('[class*="cursor-pointer"][class*="Card"]').all();
    console.log(`Found ${skuCards.length} SKU cards`);
    
    // Check checkboxes
    console.log('\n=== CHECKBOXES ===');
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    console.log(`Found ${checkboxes.length} checkboxes`);
    for (let i = 0; i < checkboxes.length; i++) {
      const isChecked = await checkboxes[i].isChecked();
      console.log(`Checkbox ${i}: ${isChecked ? 'checked' : 'unchecked'}`);
    }
    
    // Try clicking a SKU card and see what happens
    console.log('\n=== TESTING SKU SELECTION ===');
    const firstCard = page.locator('[class*="cursor-pointer"][class*="Card"]').first();
    const initialClasses = await firstCard.getAttribute('class');
    console.log('Initial card classes:', initialClasses);
    
    await firstCard.click();
    await page.waitForTimeout(1000);
    
    const afterClickClasses = await firstCard.getAttribute('class');
    console.log('After click classes:', afterClickClasses);
    
    // Check if selection changed
    const hasRingClass = afterClickClasses?.includes('ring-2');
    console.log('Has ring class after click:', hasRingClass);
    
    // Test search
    console.log('\n=== TESTING SEARCH ===');
    const searchInput = page.locator('input[placeholder="Search SKUs..."]');
    await searchInput.fill('CDS');
    await page.waitForTimeout(1000);
    
    const visibleCardsAfterSearch = await page.locator('[class*="cursor-pointer"][class*="Card"]:visible').count();
    console.log('Visible cards after search "CDS":', visibleCardsAfterSearch);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
    console.log('\nScreenshot saved as debug-screenshot.png');
  });
});