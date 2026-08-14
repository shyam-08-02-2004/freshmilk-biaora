const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    localStorage.setItem('biaora_isLoggedIn', 'true');
    localStorage.setItem('biaora_currentUser', JSON.stringify({ name: 'Shyam', mobile: '1234567890', role: 'user' }));
  });
  
  await page.reload({ waitUntil: 'networkidle2' });
  
  // Try to click the + button for Milk
  try {
    const qtyDisplays = await page.$$('.qty-display');
    const initialQty = await page.evaluate(el => el.textContent, qtyDisplays[0]);
    console.log('Initial Milk Qty:', initialQty);
    
    // The + button is the second button in the qty-control div
    const plusButtons = await page.$$('.qty-control button:nth-child(3)');
    await plusButtons[0].click();
    
    // Wait for react render
    await new Promise(r => setTimeout(r, 500));
    
    const newQty = await page.evaluate(el => el.textContent, qtyDisplays[0]);
    console.log('New Milk Qty:', newQty);
  } catch(e) {
    console.error("Test failed:", e);
  }
  
  await browser.close();
})();
