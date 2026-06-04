const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.createContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:9002/dashboard/guides', { waitUntil: 'networkidle' });
    
    // Wait for the filter bar to load
    await page.waitForSelector('[class*="rounded-xl"][class*="bg-white"]', { timeout: 5000 });
    
    // Take a screenshot
    const screenshotPath = path.join(path.dirname(__filename), 'filter-bar-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Get filter bar HTML for inspection
    const filterBarHtml = await page.locator('div.rounded-xl.border.bg-white').first().innerHTML();
    console.log('Filter bar HTML:', filterBarHtml.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
