import { Car } from './sim/car.js';
import { Arena } from './sim/arena.js';
import { initWorkspace } from './editor/workspace.js';

let car;
let arena;
let finishReported = false;
let resizeObserver;

const syncSimCanvas = () => {
    const simP5 = window.simP5;
    const simContainer = document.getElementById('sim-canvas-container');
    if (!simP5 || !simContainer) return;

    simP5.resizeCanvas(simContainer.clientWidth, simContainer.clientHeight);
    if (arena) {
        arena.width = simP5.width;
        arena.height = simP5.height;
    }
};

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
        canvas.style('display', 'block');
        canvas.style('width', '100%');
        canvas.style('height', '100%');
        canvas.elt.style.objectFit = 'contain';
        
        arena = new Arena(p, p.width, p.height);
        car = new Car(p.width / 2, p.height - 60);
        window.car = car;
        window.simP5 = p;

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                syncSimCanvas();
                if (window.blocklyWorkspace) {
                    Blockly.svgResize(window.blocklyWorkspace);
                }
            });
            resizeObserver.observe(container);
            resizeObserver.observe(document.getElementById('centre-workspace'));
        }
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
        syncSimCanvas();
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

    const workspaceContainer = document.getElementById('workspace-container');
    const leftSplitter = document.querySelector('.panel-splitter[data-target="left"]');
    const rightSplitter = document.querySelector('.panel-splitter[data-target="right"]');
    let leftPanelWidth = 220;
    let rightPanelWidth = 400;
    let activeDrag = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const syncBlockly = () => {
        if (window.blocklyWorkspace) {
            Blockly.svgResize(window.blocklyWorkspace);
        }
    };

    const applyPanelSizes = () => {
        document.documentElement.style.setProperty('--left-panel-w', `${leftPanelWidth}px`);
        document.documentElement.style.setProperty('--right-panel-w', `${rightPanelWidth}px`);
        syncSimCanvas();
        syncBlockly();
    };

    const stopDrag = () => {
        if (!activeDrag) return;
        document.body.classList.remove('is-dragging-panels');
        document.removeEventListener('pointermove', activeDrag.onMove);
        document.removeEventListener('pointerup', activeDrag.onStop);
        document.removeEventListener('pointercancel', activeDrag.onStop);
        window.removeEventListener('blur', activeDrag.onStop);
        activeDrag = null;
    };

    const startDrag = (side, e) => {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();

        stopDrag();
        document.body.classList.add('is-dragging-panels');

        const onMove = (ev) => {
            const rect = workspaceContainer.getBoundingClientRect();
            if (side === 'left') {
                const width = ev.clientX - rect.left;
                leftPanelWidth = clamp(width, 180, 320);
            } else {
                const width = rect.right - ev.clientX;
                rightPanelWidth = clamp(width, 330, 480);
            }
            applyPanelSizes();
        };

        const onStop = () => stopDrag();

        activeDrag = { onMove, onStop };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onStop, { once: true });
        document.addEventListener('pointercancel', onStop, { once: true });
        window.addEventListener('blur', onStop, { once: true });
    };

    leftSplitter.addEventListener('pointerdown', (e) => startDrag('left', e));
    rightSplitter.addEventListener('pointerdown', (e) => startDrag('right', e));
    applyPanelSizes();
});
