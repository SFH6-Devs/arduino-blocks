import { Arena } from './arena.mjs';
import { distanceAhead, isOnLine } from './sensors.mjs';

let failures = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        failures++;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

// Mock p5 instance
const mockP5 = {
    background: () => {},
    fill: () => {},
    noStroke: () => {},
    stroke: () => {},
    strokeWeight: () => {},
    circle: () => {},
    line: () => {},
    rect: () => {},
    textAlign: () => {},
    textSize: () => {},
    text: () => {},
    CENTER: 'center'
};

function runTests() {
    console.log("Running Math Tests...");

    // Test 1: distanceAhead - Facing the right wall
    const arena1 = new Arena(mockP5, 800, 500, 'open');
    const car1 = { x: 750, y: 250, heading: 0 };
    const d1 = distanceAhead(car1, arena1);
    assert(Math.abs(d1 - 50) <= 5, `Expected distance to be ~50, got ${d1}`);

    // Test 2: distanceAhead - Facing the bottom wall
    const car2 = { x: 400, y: 480, heading: Math.PI / 2 };
    const d2 = distanceAhead(car2, arena1);
    assert(Math.abs(d2 - 20) <= 5, `Expected distance to be ~20, got ${d2}`);

    // Test 3: distanceAhead - Facing an obstacle
    const arena2 = new Arena(mockP5, 800, 500, 'obstacle');
    const car3 = { x: 150, y: 240, heading: 0 };
    const d3 = distanceAhead(car3, arena2);
    assert(Math.abs(d3 - 50) <= 5, `Expected distance to be ~50, got ${d3}`);
    
    // Test 4: distanceAhead - Exceeding maxDist
    const car4 = { x: 10, y: 250, heading: 0 };
    const d4 = distanceAhead(car4, arena1);
    assert(d4 === 300, `Expected max distance 300, got ${d4}`);

    // Test 5: isOnLine - On a line segment
    const arena3 = new Arena(mockP5, 800, 500, 'line');
    const car5 = { x: 400, y: 450, heading: 0 };
    const onLine1 = isOnLine(car5, arena3);
    assert(onLine1 === true, `Expected car to be on line (segment 1), got ${onLine1}`);

    // Test 6: isOnLine - Off the line
    const car6 = { x: 300, y: 450, heading: 0 };
    const onLine2 = isOnLine(car6, arena3);
    assert(onLine2 === false, `Expected car to be off line, got ${onLine2}`);
    
    // Test 7: isOnLine - Edge of threshold
    const car7 = { x: 412, y: 450, heading: 0 }; 
    const onLine3 = isOnLine(car7, arena3);
    assert(onLine3 === true, `Expected car at threshold (12) to be on line, got ${onLine3}`);
    
    const car8 = { x: 413, y: 450, heading: 0 }; 
    const onLine4 = isOnLine(car8, arena3);
    assert(onLine4 === false, `Expected car past threshold to be off line, got ${onLine4}`);

    if (failures > 0) {
        console.error(`\n❌ ${failures} test(s) failed.`);
        process.exit(1);
    } else {
        console.log(`\n✅ All tests passed!`);
        process.exit(0);
    }
}

runTests();
