import { chromium } from 'playwright';

(async () => {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '../screenshot_full.png', fullPage: true });
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit();
    }
})();
