import { chromium } from 'playwright';

(async () => {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error(`Browser Error: ${msg.text()}`);
            } else {
                console.log(`Browser: ${msg.text()}`);
            }
        });
        
        page.on('pageerror', error => {
            console.error(`Page Error: ${error.message}`);
        });

        await page.goto('http://localhost:8080');
        await page.waitForTimeout(2000);
        
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit();
    }
})();
