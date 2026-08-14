const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Inject mock user to bypass auth
  await page.evaluate(() => {
    localStorage.setItem('biaora_isLoggedIn', 'true');
    localStorage.setItem('biaora_currentUser', JSON.stringify({ name: 'Shyam', mobile: '1234567890', role: 'user' }));
  });
  
  await page.reload({ waitUntil: 'networkidle2' });
  
  console.log('App loaded with user data.');
  await browser.close();
})();
