import { Car } from './sim/car.js';
import { Arena } from './sim/arena.js';

let car;
let arena;
let finishReported = false;

const sketch = (p) => {
    p.setup = () => {
        const container = document.getElementById('sim-canvas-container');
        const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
        canvas.parent('sim-canvas-container');
        
        arena = new Arena(p, p.width, p.height);
        car = new Car(p.width / 2, p.height - 60);
        
        // Expose to window for console testing
        window.car = car;
        
        console.log("ArduinoSim Phase 1 Initialized.");
        document.getElementById('console-output').textContent += "System ready. Try window.car.forward(500) in console.\n";
    };

    p.draw = () => {
        arena.draw();
        
        if (car) {
            car.update(arena);
            car.draw(p);
            
            // Check finish line
            if (arena.checkFinish(car.x, car.y) && !finishReported) {
                finishReported = true;
                console.log("Finish line reached!");
                document.getElementById('console-output').textContent += "Finish line reached!\n";
            }
        }
    };
    
    p.windowResized = () => {
        const container = document.getElementById('sim-canvas-container');
        p.resizeCanvas(container.clientWidth, container.clientHeight);
        // Ensure car stays in bounds
        if (arena) {
            arena.width = p.width;
            arena.height = p.height;
        }
    };
};

// Start p5
new p5(sketch);

// Wire up UI buttons
document.getElementById('reset-btn').addEventListener('click', () => {
    if (car && arena) {
        car.reset(arena.width / 2, arena.height - 60);
        finishReported = false;
        document.getElementById('console-output').textContent += "Car reset.\n";
    }
});
