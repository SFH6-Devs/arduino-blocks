import { chromium } from 'playwright';

(async () => {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('http://localhost:8080');
        await page.waitForTimeout(1000);
        
        await page.evaluate(() => {
            localStorage.setItem('arduinosim_xp', '200');
            location.reload();
        });
        await page.waitForTimeout(1000);

        await page.evaluate(() => {
            const m5Btn = Array.from(document.querySelectorAll('.mission-card button')).find(btn => btn.closest('.mission-card').querySelector('h3').innerText.includes('Follow the Line'));
            if (m5Btn) m5Btn.click();
        });
        await page.waitForTimeout(500);

        // Continuous steering line follower using dual sensors
        const dualSensorCode = `
            while (true) {
                if (window.car.onLineLeft() && !window.car.onLineRight()) {
                    window.car.setMotors(0, 50); // steer left
                } else if (!window.car.onLineLeft() && window.car.onLineRight()) {
                    window.car.setMotors(50, 0); // steer right
                } else {
                    window.car.setMotors(50, 50); // straight
                }
                await new Promise(r => setTimeout(r, 10));
            }
        `;

        await page.evaluate((code) => {
            window.runMode = 'blocks';
            Blockly.JavaScript.workspaceToCode = () => code;
            document.getElementById('run-btn').click();
        }, dualSensorCode);

        // Wait 10 seconds for the robot to follow the line
        await page.waitForTimeout(10000);

        const passed = await page.evaluate(() => {
            const dialog = document.getElementById('challenge-complete-dialog');
            return dialog && dialog.open;
        });

        console.log("Mission 5 Continuous Steering passed:", passed);
        
    } catch (e) {
        console.error(e);
        process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit();
    }
})();
