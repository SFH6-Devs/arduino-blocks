import { chromium } from 'playwright';
import { spawn } from 'child_process';
import assert from 'assert';

const server = spawn('python3', ['-m', 'http.server', '8080'], {
  cwd: '../'
});

setTimeout(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    
    // wait for p5 to render
    await page.waitForTimeout(1000);
    
    console.log("TEST 1: Switch to Obstacle Course and hit an obstacle");
    
    // Click mission strip to cycle to Mission 4 (Obstacle Course)
    // Mission 1 -> 2 -> 3 -> 4 (3 clicks)
    await page.click('#mission-strip');
    await page.click('#mission-strip');
    await page.click('#mission-strip');
    
    await page.waitForTimeout(500); // Wait for draw loop to sync arena.type
    
    // Verify arena type changed
    const arenaType = await page.evaluate(() => window.arena.type);
    assert.strictEqual(arenaType, 'obstacle', 'Arena type should be obstacle');
    
    // Drive into the obstacle
    // Car starts at 400, 440 facing UP (heading 0)
    // Obstacle is at 350, 350. Driving forward 100 will hit it.
    await page.evaluate(() => {
      window.car.forward(3000); // drive forward for 3 seconds
    });
    
    await page.waitForTimeout(3000); // Let movement simulate
    
    const isCrashed = await page.evaluate(() => window.car.crashed);
    assert.strictEqual(isCrashed, true, 'Car should crash when driving into obstacle');
    console.log("✅ Obstacle crash verified!");
    
    // take a screenshot of the crash
    await page.screenshot({ path: 'screenshot_crash.png' });
    
    // Reset the car
    await page.evaluate(() => {
        document.getElementById('reset-btn').click();
    });
    await page.waitForTimeout(500);
    
    console.log("TEST 2: Switch to Follow the Line and verify line detection");
    
    // Cycle to Mission 5 (Follow the Line)
    await page.click('#mission-strip');
    await page.waitForTimeout(500);
    
    const arenaType2 = await page.evaluate(() => window.arena.type);
    assert.strictEqual(arenaType2, 'line', 'Arena type should be line');
    
    // Teleport car exactly onto a line segment (400, 500)
    await page.evaluate(() => {
        window.car.x = 400;
        window.car.y = 500;
    });
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshot_line.png' });
    
    // We can evaluate our sensor function manually or just test the math logic against the live environment
    const onLine = await page.evaluate(async () => {
        // dynamic import of sensor logic from live page
        const mod = await import('./sim/sensors.js');
        return mod.isOnLine(window.car, window.arena);
    });
    
    assert.strictEqual(onLine, true, 'Car should detect it is on the line');
    console.log("✅ Line tracking verified!");

    console.log("All UI tests passed vigorously!");

  } catch (err) {
    console.error("❌ TEST FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill();
    process.exit();
  }
}, 2000);
