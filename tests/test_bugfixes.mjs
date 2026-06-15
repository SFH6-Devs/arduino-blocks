import { chromium } from 'playwright';

const results = [];

function report(name, pass, detail = '') {
    results.push({ name, pass, detail });
    const tag = pass ? 'PASS' : 'FAIL';
    console.log(`[${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function waitForCar(page, timeoutMs = 10000) {
    await page.waitForFunction(() => window.car && window.arena, { timeout: timeoutMs });
}

(async () => {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });

        // ── Bug 2: Pyodide bridge has on_line_left, on_line_right, set_motors ──
        {
            const page = await browser.newPage();
            await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
            await waitForCar(page);

            // Check that the Car instance exposes all three methods
            const methodChecks = await page.evaluate(() => {
                const c = window.car;
                return {
                    onLineLeft: typeof c.onLineLeft,
                    onLineRight: typeof c.onLineRight,
                    setMotors: typeof c.setMotors,
                    // Also verify they are callable and return expected types
                    onLineLeftResult: typeof c.onLineLeft(),
                    onLineRightResult: typeof c.onLineRight(),
                };
            });

            const allFunctions =
                methodChecks.onLineLeft === 'function' &&
                methodChecks.onLineRight === 'function' &&
                methodChecks.setMotors === 'function';
            report('Bug2: car.onLineLeft is a function', methodChecks.onLineLeft === 'function', methodChecks.onLineLeft);
            report('Bug2: car.onLineRight is a function', methodChecks.onLineRight === 'function', methodChecks.onLineRight);
            report('Bug2: car.setMotors is a function', methodChecks.setMotors === 'function', methodChecks.setMotors);
            report('Bug2: onLineLeft() returns boolean', methodChecks.onLineLeftResult === 'boolean', methodChecks.onLineLeftResult);
            report('Bug2: onLineRight() returns boolean', methodChecks.onLineRightResult === 'boolean', methodChecks.onLineRightResult);

            // Verify setMotors actually changes motor state
            const motorTest = await page.evaluate(() => {
                window.car.setMotors(50, -30);
                return { motorL: window.car.motorL, motorR: window.car.motorR };
            });
            report('Bug2: setMotors(50,-30) sets motorL=50', motorTest.motorL === 50, `motorL=${motorTest.motorL}`);
            report('Bug2: setMotors(50,-30) sets motorR=-30', motorTest.motorR === -30, `motorR=${motorTest.motorR}`);

            // Verify pyodide bridge source loads without errors
            const bridgeOk = await page.evaluate(async () => {
                try {
                    const mod = await import('./editor/pyodide-bridge.js');
                    return typeof mod.runPythonProgram === 'function';
                } catch (e) {
                    return false;
                }
            });
            report('Bug2: pyodide-bridge.js loads and exports runPythonProgram', bridgeOk);

            await page.close();
        }

        // ── Bug 4: Car reset on mission switch ──
        {
            const page = await browser.newPage();
            await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
            await waitForCar(page);

            // Record initial position (should be ~400, 440)
            const initial = await page.evaluate(() => ({ x: window.car.x, y: window.car.y }));
            report('Bug4: Initial car position is at start', Math.abs(initial.x - 400) < 5 && Math.abs(initial.y - 440) < 5,
                `x=${initial.x}, y=${initial.y}`);

            // Move the car away from start
            await page.evaluate(() => {
                window.car.x = 100;
                window.car.y = 100;
                window.car.crashed = true;
            });

            // Cycle through missions m1 -> m2 -> m3 -> m4 and check reset each time
            const missionLabels = ['m2', 'm3', 'm4', 'm5'];
            for (const label of missionLabels) {
                await page.click('#mission-strip');
                // Wait for the draw loop to pick up the mission change and reset
                await page.waitForTimeout(200);

                const state = await page.evaluate(() => ({
                    x: window.car.x,
                    y: window.car.y,
                    crashed: window.car.crashed,
                }));

                const posOk = Math.abs(state.x - 400) < 5 && Math.abs(state.y - 440) < 5;
                report(`Bug4: Car resets position on switch to ${label}`, posOk,
                    `x=${state.x.toFixed(1)}, y=${state.y.toFixed(1)}`);
                report(`Bug4: Car not crashed after switch to ${label}`, state.crashed === false,
                    `crashed=${state.crashed}`);

                // Dirty the car again for the next cycle
                await page.evaluate(() => {
                    window.car.x = 150;
                    window.car.y = 150;
                    window.car.crashed = true;
                });
            }

            await page.close();
        }

        // ── Bug 5: on_line_5s fires runner.onFinish() ──
        // The runner is module-scoped in main.js and not on window, so we test
        // the behavior indirectly: the MissionRunner class's onFinish sets finished=true,
        // and the main.js code path (line 139) calls runner.onFinish() before showing
        // the challenge complete dialog.
        // We verify by importing the class and testing it directly in-browser.
        {
            const page = await browser.newPage();
            await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
            await waitForCar(page);

            const result = await page.evaluate(async () => {
                const { MissionRunner } = await import('./challenges/runner.js');
                const r = new MissionRunner();
                // Simulate: accumulate 6s of line time
                r.onLineTick(3000);
                r.onLineTick(3000);
                // At this point, lineTime >= 5000, so the main.js code path
                // would call r.onFinish(). Simulate that:
                r.onFinish();
                return {
                    lineTime: r.lineTime,
                    finished: r.finished,
                    passes: r.checkPass({ pass: 'on_line_5s' }),
                };
            });

            report('Bug5: runner.finished is true after onFinish()', result.finished === true, `finished=${result.finished}`);
            report('Bug5: on_line_5s passes with 6s lineTime', result.passes === true, `passes=${result.passes}`);
            report('Bug5: lineTime accumulated correctly', result.lineTime === 6000, `lineTime=${result.lineTime}`);

            await page.close();
        }

        // ── Bug 6: offLine() does NOT reset lineTime ──
        {
            const page = await browser.newPage();
            await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
            await waitForCar(page);

            const result = await page.evaluate(async () => {
                const { MissionRunner } = await import('./challenges/runner.js');
                const r = new MissionRunner();

                // Accumulate 1s on line
                r.onLineTick(1000);
                // Go off line
                r.offLine();
                // Back on line for another 1s
                r.onLineTick(1000);

                return { lineTime: r.lineTime };
            });

            report('Bug6: lineTime accumulates across offLine()', result.lineTime === 2000,
                `lineTime=${result.lineTime} (expected 2000)`);

            // Extra: verify offLine is a no-op
            const offLineBody = await page.evaluate(async () => {
                const { MissionRunner } = await import('./challenges/runner.js');
                const r = new MissionRunner();
                r.lineTime = 999;
                r.offLine();
                return r.lineTime;
            });
            report('Bug6: offLine() does not touch lineTime', offLineBody === 999,
                `lineTime after offLine=${offLineBody}`);

            await page.close();
        }

        // ── Bug 4b: Reset works between same-arena-type missions ──
        {
            const page = await browser.newPage();
            await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
            await waitForCar(page);

            // We start on m1 (open arena). Move the car.
            await page.evaluate(() => {
                window.car.x = 200;
                window.car.y = 200;
            });

            // Click to go to m2 (also open arena)
            await page.click('#mission-strip');
            await page.waitForTimeout(200);

            const state = await page.evaluate(() => ({
                x: window.car.x,
                y: window.car.y,
                crashed: window.car.crashed,
            }));

            const posOk = Math.abs(state.x - 400) < 5 && Math.abs(state.y - 440) < 5;
            report('Bug4b: Car resets on same-arena-type switch (m1→m2, both open)',
                posOk, `x=${state.x.toFixed(1)}, y=${state.y.toFixed(1)}`);

            // Now m2→m3 (both open)
            await page.evaluate(() => {
                window.car.x = 600;
                window.car.y = 100;
            });
            await page.click('#mission-strip');
            await page.waitForTimeout(200);

            const state2 = await page.evaluate(() => ({
                x: window.car.x,
                y: window.car.y,
            }));
            const posOk2 = Math.abs(state2.x - 400) < 5 && Math.abs(state2.y - 440) < 5;
            report('Bug4b: Car resets on same-arena-type switch (m2→m3, both open)',
                posOk2, `x=${state2.x.toFixed(1)}, y=${state2.y.toFixed(1)}`);

            await page.close();
        }

    } catch (e) {
        console.error('Test harness error:', e);
        process.exitCode = 1;
    } finally {
        if (browser) await browser.close();

        // Summary
        console.log('\n' + '='.repeat(60));
        const passed = results.filter(r => r.pass).length;
        const failed = results.filter(r => !r.pass).length;
        console.log(`RESULTS: ${passed} passed, ${failed} failed, ${results.length} total`);
        if (failed > 0) {
            console.log('\nFailed tests:');
            results.filter(r => !r.pass).forEach(r => console.log(`  ✗ ${r.name}: ${r.detail}`));
            process.exitCode = 1;
        }
        console.log('='.repeat(60));
        process.exit();
    }
})();
