import { chromium } from 'playwright';
import assert from 'assert';

(async () => {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        
        // Switch to Obstacle Course (m4)
        await page.click('#mission-strip');
        await page.click('#mission-strip');
        await page.click('#mission-strip');
        await page.waitForTimeout(500);
        
        // This python code simulates what a user would build with blocks
        // Car starts at (400, 440) facing UP
        // If it detects an obstacle (< 50), it dodges right, drives, then turns back left.
        await page.evaluate(async () => {
             const { runPythonProgram } = await import('./editor/pyodide-bridge.js');
             const code = `
async def run():
  for _ in range(25):
    if car.distance() < 60:
      await car.turn_right(90)
      await car.forward(1200)
      await car.turn_left(90)
    await car.forward(200)

await run()
             `;
             await runPythonProgram(code);
        });
        
        await page.waitForTimeout(500);
        
        const crashed = await page.evaluate(() => window.car.crashed);
        const y = await page.evaluate(() => window.car.y);
        
        console.log("Crashed?", crashed);
        console.log("Final Y:", y);
        
        assert.strictEqual(crashed, false, "Car crashed into obstacle!");
        assert.ok(y < 40, "Car did not reach finish line! Y=" + y);
        
        console.log("SUCCESS: User was able to beat the level using the blocks!");
        
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit();
    }
})();
