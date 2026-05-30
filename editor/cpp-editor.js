import { createMonacoEditor, loadMonaco } from './monaco.js';

const state = {
    ready: null,
    editor: null,
    dirty: false,
    applyingWorkspace: false,
    workspaceSource: ''
};

const getContainer = () => document.getElementById('cpp-editor');

const buildCppSketch = (body) => {
    if (typeof window.buildCppSketch === 'function') {
        return window.buildCppSketch(body);
    }

    const indentLines = (code, indent = '    ') => {
        return code.split('\n').map((line) => (line ? `${indent}${line}` : line)).join('\n');
    };

    const normalizedBody = body && body.trim()
        ? indentLines(body.trimEnd())
        : '    // Drag blocks into the workspace to generate C++.\n';

    return [
        '#include <Arduino.h>',
        '',
        'void setup() {',
        '    // Initialize hardware here if needed.',
        '}',
        '',
        'void loop() {',
        normalizedBody,
        '}',
        ''
    ].join('\n');
};

export async function initCppEditor() {
    if (state.ready) return state.ready;

    state.ready = (async () => {
        const monaco = await loadMonaco();
        const container = getContainer();
        if (!container) {
            throw new Error('C++ editor container is missing.');
        }

        state.editor = createMonacoEditor(monaco, container, 'cpp', state.workspaceSource);
        state.editor.onDidChangeModelContent(() => {
            if (state.applyingWorkspace) return;

            state.dirty = true;
            window.generatedCpp = state.editor.getValue();
        });

        window.generatedCpp = state.editor.getValue();
        return state.editor;
    })();

    return state.ready;
}

export function syncCppFromWorkspace(body) {
    state.workspaceSource = buildCppSketch(body || '');

    if (!state.editor) {
        window.generatedCpp = state.workspaceSource;
        return;
    }

    if (!state.dirty && state.editor.getValue() !== state.workspaceSource) {
        state.applyingWorkspace = true;
        state.editor.setValue(state.workspaceSource);
        state.applyingWorkspace = false;
        state.dirty = false;
    }

    window.generatedCpp = state.editor.getValue();
}

export function getCppSource() {
    return state.editor ? state.editor.getValue() : state.workspaceSource;
}

export function layoutCppEditor() {
    if (state.editor) {
        state.editor.layout();
    }
}
