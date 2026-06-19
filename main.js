import { Car } from './sim/car.js';
import { Arena } from './sim/arena.js';
import { initWorkspace } from './editor/workspace.js';
import { clearConsole } from './ui/console.js';
import { MissionRunner } from './challenges/runner.js';
import { loadXP, addXP } from './ui/xp.js';
import { loadMissions, getActiveMission, showChallengeComplete, showMissionFailed } from './ui/missions.js';

let car;
let arena;
let simLayer;
let finishReported = false;
let resizeObserver;
let runner = null;
// Expose for testing
window.getRunner = () => runner;
runner = new MissionRunner();
let prevCrashed = false;
let turnInProgress = false;
let lastMissionId = null;

const syncSimCanvas = () => {
    const simP5 = window.simP5;
    const simContainer = document.getElementById('sim-canvas-container');
    if (!simP5 || !simContainer) return;

    simP5.resizeCanvas(simContainer.clientWidth, simContainer.clientHeight);
};

const syncBlocklyLayout = () => {
    if (window.blocklyWorkspace) {
        Blockly.svgResize(window.blocklyWorkspace);
    }
    if (window.layoutActiveCodeEditor) {
        window.layoutActiveCodeEditor();
    }
};

// Global Toast Function
window.showToast = function(msg, type = "success") {
    const container = document.getElementById('toast-container');
    while (container.children.length >= 3) {
        container.firstElementChild.remove();
    }
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
        
        simLayer = p.createGraphics(800, 500);
        arena = new Arena(simLayer, 800, 500);
        car = new Car(arena.width / 2, arena.height - 60);
        window.car = car;
        window.arena = arena;
        window.simP5 = p;

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                syncSimCanvas();
                syncBlocklyLayout();
            });
            resizeObserver.observe(document.getElementById('sim-canvas-container'));
            resizeObserver.observe(document.getElementById('centre-workspace'));
        }
    };

    p.draw = () => {
        const scale = Math.min(p.width / arena.width, p.height / arena.height);
        const drawW = arena.width * scale;
        const drawH = arena.height * scale;
        const offsetX = (p.width - drawW) / 2;
        const offsetY = (p.height - drawH) / 2;

        simLayer.background(20, 22, 35);
        
        const mission = getActiveMission();
        if (mission && mission.id !== lastMissionId) {
            lastMissionId = mission.id;
            arena = new Arena(simLayer, 800, 500, mission.arena);
            window.arena = arena;
            resetCar();
            finishReported = false;
            runner.reset();
            prevCrashed = false;
            turnInProgress = false;
        }
        
        arena.draw();
        
        if (car) {
            car.update(arena);
            car.draw(simLayer);

            // Update UI Sensors
            if (p.frameCount % 5 === 0) {
                document.getElementById('sensor-distance').innerText = `Distance: ${Math.round(car.distance())}cm`;
                document.getElementById('sensor-line-l').innerText = `Line L: ${car.onLineLeft() ? 'YES' : 'NO'}`;
                document.getElementById('sensor-line-r').innerText = `Line R: ${car.onLineRight() ? 'YES' : 'NO'}`;
                // If a discrete action is running, estimate motor speeds, else use continuous motor state
                let dispL = car.motorL;
                let dispR = car.motorR;
                if (car.action) {
                    if (car.action.type === 'forward') { dispL = 50; dispR = 50; }
                    else if (car.action.type === 'back') { dispL = -50; dispR = -50; }
                    else if (car.action.type === 'turnLeft') { dispL = -50; dispR = 50; }
                    else if (car.action.type === 'turnRight') { dispL = 50; dispR = -50; }
                }
                document.getElementById('sensor-motor-l').innerText = `Motor L: ${Math.round(dispL)}%`;
                document.getElementById('sensor-motor-r').innerText = `Motor R: ${Math.round(dispR)}%`;
            }

            if (car.crashed && !prevCrashed && !finishReported) {
                runner.onCollision();
                const mission = getActiveMission();
                if (mission && mission.pass !== 'reach_finish') {
                    showMissionFailed(mission?.failMsg || "You crashed!");
                }
            }
            prevCrashed = car.crashed;

            const isTurning = car.action && car.action.type && car.action.type.startsWith('turn');
            if (isTurning && !turnInProgress) {
                runner.onTurn();
            }
            turnInProgress = isTurning;
            
            const mission = getActiveMission();
            if (mission && mission.arena === 'line') {
                if (car.onLineLeft() || car.onLineRight()) {
                    if (!car.crashed && (Math.abs(car.motorL) > 0.1 || Math.abs(car.motorR) > 0.1)) {
                        runner.onLineTick(p.deltaTime || 16);
                    }
                    if (runner.lineTime >= 5000 && !finishReported && !car.crashed) {
                        if (mission && mission.pass === 'on_line_5s') {
                            finishReported = true;
                            car.stop();
                            runner.onFinish();
                            const mode = window.runMode || 'blocks';
                            const xp = runner.getXPReward(mission, mode);
                            addXP(xp);
                            showChallengeComplete(mission, xp);
                        }
                    }
                } else {
                    runner.offLine();
                }
            }
            
            if (arena.checkFinish(car.x, car.y) && !finishReported && !car.crashed) {
                const mission = getActiveMission();
                let shouldWin = false;
                
                if (mission && mission.pass === 'finish_stopped') {
                    const isStopped = !car.action && Math.abs(car.motorL) < 0.1 && Math.abs(car.motorR) < 0.1;
                    if (isStopped) {
                        shouldWin = true;
                    }
                } else {
                    shouldWin = true;
                }
                
                if (shouldWin) {
                    finishReported = true;
                    car.stop();
                    runner.onFinish();

                    if (runner.checkPass(mission)) {
                        const mode = window.runMode || 'blocks';
                        const xp = runner.getXPReward(mission, mode);
                        addXP(xp);
                        showChallengeComplete(mission, xp);
                    } else {
                        showMissionFailed(mission?.failMsg);
                    }
                }
            }
        }

        p.background(13, 16, 32);
        p.image(simLayer, offsetX, offsetY, drawW, drawH);
    };
    
    p.windowResized = () => {
        syncSimCanvas();
        syncBlocklyLayout();
    };
};

new p5(sketch);

function resetCar() {
    if (car && arena) {
        clearConsole();
        const mission = getActiveMission();
        if (mission && mission.arena === 'line') {
            car.reset(400, 450);
        } else if (mission && mission.arena === 'obstacle') {
            car.reset(arena.width / 2, arena.height - 60);
        } else {
            car.reset(arena.width / 2, arena.height - 60);
        }
    }
}

document.getElementById('reset-btn').addEventListener('click', () => {
    if (car && arena) {
        clearConsole();
        resetCar();
        finishReported = false;
        runner.reset();
        prevCrashed = false;
        turnInProgress = false;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadXP();
    loadMissions();
    initWorkspace();

    document.getElementById('cc-close')?.addEventListener('click', () => {
        document.getElementById('challenge-complete-dialog').close();
    });

    const workspaceContainer = document.getElementById('workspace-container');
    const leftSplitter = document.querySelector('.panel-splitter[data-target="left"]');
    const rightSplitter = document.querySelector('.panel-splitter[data-target="right"]');
    let leftPanelWidth = 320;
    let rightPanelWidth = 400;
    let activeDrag = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const syncBlockly = () => {
        syncBlocklyLayout();
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
