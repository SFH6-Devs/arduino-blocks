import { Car } from './sim/car.js';
import { Arena } from './sim/arena.js';
import { initWorkspace } from './editor/workspace.js';

let car;
let arena;
let finishReported = false;

// Global Toast Function
window.showToast = function(msg, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const sketch = (p) => {
    p.setup = () => {
        const container = document.getElementById('sim-canvas-container');
        const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
        canvas.parent('sim-canvas-container');
        
        arena = new Arena(p, p.width, p.height);
        car = new Car(p.width / 2, p.height - 60);
        window.car = car;
    };

    p.draw = () => {
        arena.draw();
        
        if (car) {
            car.update(arena);
            car.draw(p);
            
            if (arena.checkFinish(car.x, car.y) && !finishReported && !car.crashed) {
                finishReported = true;
                car.stop();
                window.showToast("Mission Complete! +10 XP", "success");
                
                // Fire confetti!
                if (window.confetti) {
                    const canvasBounds = document.getElementById('sim-canvas-container').getBoundingClientRect();
                    const originX = (canvasBounds.left + canvasBounds.width / 2) / window.innerWidth;
                    const originY = (canvasBounds.top + 50) / window.innerHeight; // top of canvas
                    
                    window.confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { x: originX, y: originY },
                        colors: ['#4af09a', '#4d97ff', '#ffca1a']
                    });
                }
            }
        }
    };
    
    p.windowResized = () => {
        const container = document.getElementById('sim-canvas-container');
        p.resizeCanvas(container.clientWidth, container.clientHeight);
        if (arena) {
            arena.width = p.width;
            arena.height = p.height;
        }
    };
};

new p5(sketch);

document.getElementById('reset-btn').addEventListener('click', () => {
    if (car && arena) {
        car.reset(arena.width / 2, arena.height - 60);
        finishReported = false;
        // Optionally clear console
        // document.getElementById('console-output').textContent = "";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    initWorkspace();
});
