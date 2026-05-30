import { createMonacoEditor, loadMonaco } from './monaco.js';
import { runPythonProgram } from './pyodide-bridge.js';

const state = {
    ready: null,
    editor: null,
    dirty: false,
    applyingWorkspace: false,
    workspaceSource: ''
};

const getContainer = () => document.getElementById('python-editor');

export async function initPythonEditor() {
    if (state.ready) return state.ready;

    state.ready = (async () => {
        const monaco = await loadMonaco();
        const container = getContainer();
        if (!container) {
            throw new Error('Python editor container is missing.');
        }

        state.editor = createMonacoEditor(monaco, container, 'python', state.workspaceSource);
        state.editor.onDidChangeModelContent(() => {
            if (state.applyingWorkspace) return;

            state.dirty = true;
            window.generatedPython = state.editor.getValue();
        });

        window.generatedPython = state.editor.getValue();
        return state.editor;
    })();

    return state.ready;
}

export function syncPythonFromWorkspace(source) {
    state.workspaceSource = source || '';

    if (!state.editor) {
        window.generatedPython = state.workspaceSource;
        return;
    }

    if (!state.dirty && state.editor.getValue() !== state.workspaceSource) {
        state.applyingWorkspace = true;
        state.editor.setValue(state.workspaceSource);
        state.applyingWorkspace = false;
        state.dirty = false;
    }

    window.generatedPython = state.editor.getValue();
}

export function getPythonSource() {
    return state.editor ? state.editor.getValue() : state.workspaceSource;
}

export function layoutPythonEditor() {
    if (state.editor) {
        state.editor.layout();
    }
}

export async function runPythonEditor() {
    const source = getPythonSource();
    if (!source.trim()) {
        throw new Error('Add some Python code first.');
    }

    return runPythonProgram(source);
}
