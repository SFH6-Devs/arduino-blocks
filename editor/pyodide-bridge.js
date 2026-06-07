import { appendConsoleLine } from '../ui/console.js';

let pyodidePromise = null;
let pyodideInstance = null;

const PY_HELPERS = `
import asyncio

async def sleep(seconds):
    await asyncio.sleep(seconds)
`;

const normaliseOutput = (value) => String(value ?? '').replace(/\r?\n+$/, '');

const PYTHON_ERROR_RE = /File "<exec>", line (\d+)/;

export function formatPythonError(error) {
    const raw = error?.message || String(error);
    const match = raw.match(PYTHON_ERROR_RE);
    const line = match ? parseInt(match[1], 10) : null;
    const label = line !== null ? `Python error (line ${line})` : 'Python error';

    const lastLine = raw.split('\n').findLast((l) => l.trim().length > 0) || raw;
    return { label, detail: lastLine.trim(), line, raw };
}

const requireCar = () => {
    if (!window.car) {
        throw new Error('Simulation is not ready yet.');
    }

    return window.car;
};

const carBridge = {
    forward: (time) => requireCar().forward(time),
    back: (time) => requireCar().back(time),
    turn_left: (degrees) => requireCar().turnLeft(degrees),
    turn_right: (degrees) => requireCar().turnRight(degrees),
    set_speed: (speed) => requireCar().setSpeed(speed),
    stop: () => requireCar().stop(),
    distance: () => requireCar().distance(),
    on_line: () => requireCar().onLine()
};

const installStreamHandlers = (pyodide) => {
    pyodide.setStdout({
        batched: (message) => appendConsoleLine(normaliseOutput(message))
    });
    pyodide.setStderr({
        batched: (message) => appendConsoleLine(normaliseOutput(message))
    });
};

export async function ensurePyodideRuntime() {
    if (pyodideInstance) return pyodideInstance;

    if (!pyodidePromise) {
        pyodidePromise = (async () => {
            if (typeof loadPyodide !== 'function') {
                throw new Error('Pyodide loader is not available.');
            }

            appendConsoleLine('Loading Python runtime...');
            const pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
            });

            installStreamHandlers(pyodide);
            pyodide.globals.set('car', carBridge);
            await pyodide.runPythonAsync(PY_HELPERS);

            pyodideInstance = pyodide;
            return pyodide;
        })();
    }

    return pyodidePromise;
}

export async function runPythonProgram(source) {
    const pyodide = await ensurePyodideRuntime();
    try {
        return await pyodide.runPythonAsync(source);
    } catch (err) {
        const formatted = formatPythonError(err);
        const error = new Error(formatted.label);
        error.formatted = formatted;
        throw error;
    }
}
