const puppeteer = require('puppeteer');

async function checkFunctionality() {
  console.log('Starting functionality check...');
  
  // Check if puppeteer is available
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Navigating to forecast page...');
    await page.goto('http://localhost:3000/forecast-working', { waitUntil: 'networkidle2' });
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if main elements exist
    const hasHeader = await page.$('h1:has-text("Sales Forecast")') !== null;
    console.log('Has header:', hasHeader);
    
    // Check SKU cards
    const skuCards = await page.$$('[class*="cursor-pointer"]');
    console.log('Number of clickable elements:', skuCards.length);
    
    // Try clicking a card
    console.log('\nTesting SKU selection...');
    const cardsBefore = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.ring-2.ring-blue-500')).length;
    });
    console.log('Selected cards before click:', cardsBefore);
    
    // Click on a card
    await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"][class*="Card"]');
      if (cards[1]) cards[1].click();
    });
    
    await page.waitForTimeout(1000);
    
    const cardsAfter = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.ring-2.ring-blue-500')).length;
    });
    console.log('Selected cards after click:', cardsAfter);
    console.log('Selection changed:', cardsBefore !== cardsAfter);
    
    // Test search
    console.log('\nTesting search...');
    await page.type('input[placeholder="Search SKUs..."]', 'CDS');
    await page.waitForTimeout(1000);
    
    const visibleCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"][class*="Card"]');
      return Array.from(cards).filter(card => {
        const style = window.getComputedStyle(card);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }).length;
    });
    console.log('Visible cards after search "CDS":', visibleCards);
    
    await browser.close();
    console.log('\nCheck complete!');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nInstalling puppeteer...');
    require('child_process').execSync('npm install puppeteer', { stdio: 'inherit' });
    console.log('Please run this script again.');
  }
}

checkFunctionality();