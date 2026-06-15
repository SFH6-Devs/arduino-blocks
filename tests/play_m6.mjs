import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: '/home/creole/Documents/arduino-blocks/tests/videos/', size: { width: 1280, height: 720 } }
    });
    const page = await context.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.evaluate(() => {
        window.debugInterval = setInterval(() => {
            if (window.car && window.getRunner()) {
                console.log(`Car at x=${window.car.x.toFixed(1)}, y=${window.car.y.toFixed(1)}, L=${window.car.motorL}, R=${window.car.motorR}, crash=${window.car.crashed}`);
            }
        }, 100);
    });

    // Helper: wait for completion dialog to appear
    const waitForComplete = async (timeoutMs = 15000) => {
        try {
            await page.waitForFunction(() => {
                const d = document.getElementById('challenge-complete-dialog');
                return d && d.open;
            }, { timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    };

    // Helper: click Next Mission and wait for reset
    const nextMission = async () => {
        await page.click('#cc-next');
        await page.waitForTimeout(800);
    };

    // Helper: click Reset
    const resetCar = async () => {
        await page.click('#reset-btn');
        await page.waitForTimeout(300);
    };

    try {
        await page.goto('http://localhost:8080');
        await page.evaluate(() => {
            localStorage.setItem('arduinosim_xp', '500');
        });
        await page.waitForTimeout(1000);

        // Click through to M6
        for(let i=0; i<5; i++) {
            await page.click('#mission-strip');
            await page.waitForTimeout(200);
        }
        await page.waitForTimeout(500);

        const missions = ['M6'];
        const timeouts = [60000];

        for (let i = 0; i < missions.length; i++) {
            console.log(`=== ${missions[i]} ===`);
            
            // Inject solution directly
            await page.evaluate(async (mId) => {
                const { MISSION_SOLUTIONS } = await import('/editor/solutions.js');
                const xmlStr = MISSION_SOLUTIONS[mId];
                if (xmlStr) {
                    window.blocklyWorkspace.clear();
                    const xml = Blockly.utils.xml.textToDom(xmlStr);
                    Blockly.Xml.domToWorkspace(xml, window.blocklyWorkspace);
                }
            }, missions[i].toLowerCase());
            await page.waitForTimeout(500);

            // Run the loaded solution
            await page.evaluate(() => {
                window.debugInterval = setInterval(() => {
                    if (window.car && window.getRunner()) {
                        console.log(`Car at x=${window.car.x.toFixed(1)}, y=${window.car.y.toFixed(1)}, L=${window.car.motorL}, R=${window.car.motorR}, crash=${window.car.crashed}, lineTime=${window.getRunner().lineTime}, type=${window.arena ? window.arena.type : 'none'}, onLeft=${window.car.onLineLeft()}`);
                    }
                }, 100);
                // Also print the generated JS code
                if (window.Blockly && window.blocklyWorkspace && window.javascriptGenerator) {
                    console.log("GENERATED JS:", window.javascriptGenerator.workspaceToCode(window.blocklyWorkspace));
                }
            });
            await page.click('#run-btn');

            const passed = await waitForComplete(timeouts[i]);
            console.log(`${missions[i]} passed: ${passed}`);
            if (!passed) {
                console.log('  Failed. Car state:', await page.evaluate(() => ({
                    x: window.car.x,
                    y: window.car.y,
                    crashed: window.car.crashed,
                    lineTime: window.getRunner() ? window.getRunner().lineTime : 0
                })));
                console.log('  Skipping to next mission manually.');
                await page.evaluate(() => {
                    const overlay = document.getElementById('mission-complete-overlay');
                    if (overlay) overlay.style.display = 'none';
                    document.getElementById('challenge-complete-dialog')?.close();
                    const strip = document.getElementById('mission-strip');
                    strip.click(); // Hacky way to just cycle if it failed
                });
                await page.waitForTimeout(500);
            } else {
                await nextMission();
            }
            await resetCar();
        }

        console.log('\n=== ALL DONE ===');

    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await page.waitForTimeout(1000);
        await context.close();
        await browser.close();

        const fs = await import('fs');
        const videoDir = '/home/creole/Documents/arduino-blocks/tests/videos/';
        const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'));
        if (files.length > 0) {
            const latest = files.sort().pop();
            console.log(`\nVideo saved: ${videoDir}${latest}`);
            // Copy to brain for user
            fs.copyFileSync(videoDir + latest, '/home/creole/.gemini/antigravity-cli/brain/49e4b79a-f721-4b12-8c96-db8fc0c5cfa7/solutions_gameplay.webm');
        }
        process.exit();
    }
})();
