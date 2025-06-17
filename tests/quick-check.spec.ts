import { test, expect } from '@playwright/test';

test.describe('Quick Functionality Check', () => {
  test('manually verify SKU selection', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('h1:has-text("Sales Forecast")');
    
    // Let's check what actually happens when we click
    console.log('\n=== TESTING SKU SELECTION ===');
    
    // Find 6 ST card
    const skuCard = page.locator('div.cursor-pointer:has-text("6 ST")').filter({ hasText: 'Electronics' });
    const checkbox = skuCard.locator('input[type="checkbox"]');
    
    // Log initial state
    const initialChecked = await checkbox.isChecked();
    console.log(`Initial state: ${initialChecked ? 'CHECKED' : 'UNCHECKED'}`);
    
    // Click the card
    await skuCard.click();
    await page.waitForTimeout(1000);
    
    // Log new state
    const afterClickChecked = await checkbox.isChecked();
    console.log(`After click: ${afterClickChecked ? 'CHECKED' : 'UNCHECKED'}`);
    console.log(`State changed: ${initialChecked !== afterClickChecked ? 'YES' : 'NO'}`);
    
    // Check if it appears in main content
    const mainContent = await page.locator('div.glass:has-text("6 ST")').count();
    console.log(`"6 ST" appears in main content: ${mainContent} times`);
    
    // Let's also check what happens with the checkbox click
    console.log('\n=== TESTING CHECKBOX CLICK ===');
    const beforeCheckbox = await checkbox.isChecked();
    await checkbox.click();
    await page.waitForTimeout(1000);
    const afterCheckbox = await checkbox.isChecked();
    console.log(`Checkbox click changed state: ${beforeCheckbox !== afterCheckbox ? 'YES' : 'NO'}`);
  });

  test('manually verify search', async ({ page }) => {
    await page.goto('/forecast-working');
    await page.waitForSelector('h1:has-text("Sales Forecast")');
    
    console.log('\n=== TESTING SEARCH ===');
    
    // Count initial cards
    const initialCards = await page.locator('div.cursor-pointer').filter({ has: page.locator('input[type="checkbox"]') }).count();
    console.log(`Initial SKU cards: ${initialCards}`);
    
    // Search for CDS
    await page.fill('input[placeholder="Search SKUs..."]', 'CDS');
    await page.waitForTimeout(1000);
    
    // Count filtered cards
    const filteredCards = await page.locator('div.cursor-pointer').filter({ has: page.locator('input[type="checkbox"]') }).count();
    console.log(`Filtered SKU cards: ${filteredCards}`);
    
    // List what's visible
    const visibleSkus = await page.locator('div.cursor-pointer h3').allTextContents();
    console.log('Visible SKUs:', visibleSkus);
  });
});