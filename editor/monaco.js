let monacoReadyPromise = null;
let themeReady = false;

const THEME_NAME = 'arduinosim-dark';
const BASE_EDITOR_OPTIONS = {
    theme: THEME_NAME,
    automaticLayout: false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    fontSize: 14,
    lineHeight: 22,
    tabSize: 4,
    wordWrap: 'on',
    renderWhitespace: 'selection',
    renderLineHighlight: 'all',
    glyphMargin: false,
    folding: true
};

const ensureTheme = () => {
    if (!window.monaco || themeReady) return;

    window.monaco.editor.defineTheme(THEME_NAME, {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6f7aa8', fontStyle: 'italic' },
            { token: 'keyword', foreground: '4af09a', fontStyle: 'bold' },
            { token: 'number', foreground: 'ffca1a' }
        ],
        colors: {
            'editor.background': '#151a2a',
            'editor.foreground': '#f6f7ff',
            'editor.lineHighlightBackground': '#1b2136',
            'editorLineNumber.foreground': '#7782a9',
            'editorLineNumber.activeForeground': '#4af09a',
            'editorCursor.foreground': '#4af09a',
            'editor.selectionBackground': '#23304f',
            'editor.inactiveSelectionBackground': '#1c243c',
            'editorIndentGuide.background1': '#2b3250',
            'editorIndentGuide.activeBackground1': '#4af09a'
        }
    });

    themeReady = true;
};

export function loadMonaco() {
    if (window.monaco) {
        ensureTheme();
        return Promise.resolve(window.monaco);
    }

    if (!monacoReadyPromise) {
        monacoReadyPromise = new Promise((resolve, reject) => {
            if (!window.require) {
                reject(new Error('Monaco loader is not available.'));
                return;
            }

            window.require(['vs/editor/editor.main'], () => {
                ensureTheme();
                resolve(window.monaco);
            }, reject);
        });
    }

    return monacoReadyPromise;
}

export function monacoTheme() {
    return THEME_NAME;
}

export function createMonacoEditor(monaco, container, language, value = '') {
    return monaco.editor.create(container, {
        ...BASE_EDITOR_OPTIONS,
        language,
        value
    });
}
