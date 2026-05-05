import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to Storybook...');
  await page.goto('http://localhost:6007/iframe.html?id=widgets-packingchecklist--default');
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
