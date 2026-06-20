import { defineBlocks } from './blocks.js';
import { initGenerators } from './codegen.js';
import {
    getCppSource,
    initCppEditor,
    layoutCppEditor,
    syncCppFromWorkspace
} from './cpp-editor.js';
import {
    getPythonSource,
    initPythonEditor,
    isPythonEditorDirty,
    layoutPythonEditor,
    runPythonEditor,
    syncPythonFromWorkspace
} from './python-editor.js';
import { appendConsoleLine, clearConsole, writeConsoleError } from '../ui/console.js';
import { isBlockUnlocked, getUnlockLevel } from '../ui/levels.js';
import { getLevel } from '../ui/xp.js';
import { getActiveMission } from '../ui/missions.js';
import { MISSION_SOLUTIONS } from './solutions.js';

// ============================================================================
// State Management
// ============================================================================

const STATE_KEY = 'arduinosim_state';

const stateManager = {
    get() {
        try {
            return JSON.parse(localStorage.getItem(STATE_KEY)) || {};
        } catch {
            return {};
        }
    },

    set(updates) {
        const current = this.get();
        const updated = { ...current, ...updates };
        localStorage.setItem(STATE_KEY, JSON.stringify(updated));
    },

    clear() {
        localStorage.removeItem(STATE_KEY);
    },

    saveBlocksXml(workspace) {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlStr = Blockly.Xml.domToText(xml);
        this.set({ blocksXml: xmlStr });
    },

    loadBlocksXml(workspace) {
        const state = this.get();
        if (!state.blocksXml) return false;

        try {
            const xml = Blockly.utils.xml.textToDom(state.blocksXml);
            Blockly.Xml.domToWorkspace(xml, workspace);
            return true;
        } catch (e) {
            console.error('Failed to restore blocks:', e);
            return false;
        }
    },

    savePythonState(atEntry, userEdits) {
        this.set({
            pythonAtEntry: atEntry || '',
            pythonUserEdits: userEdits || ''
        });
    },

    getPythonState() {
        const state = this.get();
        return {
            atEntry: state.pythonAtEntry || '',
            userEdits: state.pythonUserEdits || ''
        };
    }
};

// ============================================================================
// Dialog Helpers
// ============================================================================

const showModeDialog = (title, message, actions) => {
    return new Promise((resolve) => {
        const dialog = document.getElementById('mode-switch-dialog');
        const titleEl = document.getElementById('dialog-title');
        const messageEl = document.getElementById('dialog-message');
        const primaryBtn = document.getElementById('dialog-primary');
        const secondaryBtn = document.getElementById('dialog-secondary');
        const cancelBtn = document.getElementById('dialog-cancel');

        titleEl.textContent = title;
        messageEl.textContent = message;

        primaryBtn.textContent = actions.primary.label;
        secondaryBtn.textContent = actions.secondary.label;

        const cleanup = () => {
            primaryBtn.removeEventListener('click', onPrimary);
            secondaryBtn.removeEventListener('click', onSecondary);
            cancelBtn.removeEventListener('click', onCancel);
            dialog.close();
        };

        const onPrimary = () => {
            cleanup();
            resolve('primary');
        };

        const onSecondary = () => {
            cleanup();
            resolve('secondary');
        };

        const onCancel = () => {
            cleanup();
            resolve('cancel');
        };

        primaryBtn.addEventListener('click', onPrimary);
        secondaryBtn.addEventListener('click', onSecondary);
        cancelBtn.addEventListener('click', onCancel);

        dialog.showModal();
    });
};

// ============================================================================
// Main Workspace Initialization
// ============================================================================

export function initWorkspace() {
    defineBlocks();
    initGenerators();

    // Patch standard Blockly blocks to match our custom styles
    const originalCompareInit = Blockly.Blocks['logic_compare'].init;
    Blockly.Blocks['logic_compare'].init = function() {
        originalCompareInit.call(this);
        this.setStyle('sensing_blocks');
    };

    const originalNumberInit = Blockly.Blocks['math_number'].init;
    Blockly.Blocks['math_number'].init = function() {
        originalNumberInit.call(this);
        this.setStyle('sensing_blocks');
    };

    const toolboxes = {
        motion: {
            kind: 'flyoutToolbox',
            contents: [
                { kind: 'block', type: 'move_forward' },
                { kind: 'block', type: 'move_back' },
                { kind: 'block', type: 'turn_left' },
                { kind: 'block', type: 'turn_right' },
                { kind: 'block', type: 'set_speed' },
                { kind: 'block', type: 'set_motors' },
                { kind: 'block', type: 'stop_car' }
            ]
        },
        control: {
            kind: 'flyoutToolbox',
            contents: [
                { kind: 'block', type: 'wait' },
                { kind: 'block', type: 'if_simple' },
                { kind: 'block', type: 'if_else' },
                { kind: 'block', type: 'if_obstacle' },
                { kind: 'block', type: 'if_on_line' }
            ]
        },
        sensing: {
            kind: 'flyoutToolbox',
            contents: [
                { kind: 'block', type: 'distance' },
                { kind: 'block', type: 'on_line_left' },
                { kind: 'block', type: 'on_line_right' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'math_number' }
            ]
        },
        loops: {
            kind: 'flyoutToolbox',
            contents: [
                { kind: 'block', type: 'repeat_times' },
                { kind: 'block', type: 'forever' }
            ]
        }
    };

    const blocklyDiv = document.getElementById('blockly-div');
    const monacoEditor = document.getElementById('monaco-editor');
    const pythonPane = document.getElementById('python-editor');
    const cppPane = document.getElementById('cpp-editor');
    const watermark = document.getElementById('workspace-watermark');
    const docsTitle = document.getElementById('docs-title');
    const docsSummary = document.getElementById('docs-summary');
    const docsSnippet = document.getElementById('docs-snippet');
    const modeButtons = Array.from(document.querySelectorAll('#mode-toggle button'));
    const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));

    const docsByCategory = {
        motion: {
            title: 'Motion',
            summary: 'Use these blocks to move the robot around the arena.',
            snippetTitle: 'How to use',
            bullets: [
                'Start with `move forward` to test basic movement.',
                'Use `set speed` before motion blocks if you want a slower or faster run.',
                'Combine `turn left` and `turn right` with `repeat` to build routes.'
            ],
            code: [
                'car.set_speed(5)',
                'await car.forward(1000)',
                'await car.turn_left(90)'
            ],
            note: 'These map to the same `car.*` API used in Python mode.'
        },
        control: {
            title: 'Control',
            summary: 'Use control blocks to pause and branch your program.',
            snippetTitle: 'How to use',
            bullets: [
                'Use `wait` to give the car a pause between actions.',
                '`if obstacle ahead` checks the ultrasonic sensor before running the nested blocks.',
                '`if on line` is useful for line-following missions later on.'
            ],
            code: [
                'if car.distance() < 20:',
                '    await sleep(1)',
                '    car.stop()'
            ],
            note: 'Control blocks are best when you want the robot to react to the arena.'
        },
        sensing: {
            title: 'Sensing',
            summary: 'Read the virtual sensors and make decisions from live values.',
            snippetTitle: 'How to use',
            bullets: [
                '`distance` returns the current distance reading in centimetres.',
                '`on line?` returns true or false for the line sensor.',
                'Use sensing blocks inside `if` blocks to make smart movement.'
            ],
            code: [
                'if car.distance() < 20:',
                '    car.stop()'
            ],
            note: 'These are the same sensors students will later connect to hardware.'
        },
        loops: {
            title: 'Loops',
            summary: 'Repeat actions without copying the same blocks again and again.',
            snippetTitle: 'How to use',
            bullets: [
                'Use `repeat` when you want a block sequence to run a fixed number of times.',
                '`forever` keeps running the nested blocks until the program ends or the car stops.',
                'Loops work well with motion and sensing blocks together.'
            ],
            code: [
                'for i in range(4):',
                '    await car.forward(500)',
                '    await car.turn_right(90)'
            ],
            note: 'Loops are the bridge from simple block programs to real Python control flow.'
        }
    };

    const renderDocs = (category) => {
        const docs = docsByCategory[category];
        if (!docs || !docsTitle || !docsSummary || !docsSnippet) return;

        docsTitle.textContent = docs.title;
        docsSummary.textContent = docs.summary;
        docsSnippet.innerHTML = `
            <article class="docs-card">
                <h3>${docs.snippetTitle}</h3>
                <ul>
                    ${docs.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
                </ul>
                <div class="docs-code">${docs.code.join('\n')}</div>
            </article>
            <article class="docs-card">
                <h3>Reference</h3>
                <p>${docs.note}</p>
            </article>
            <div class="docs-locked-hint">
                💡 Some blocks unlock as you level up — complete missions to earn XP.
            </div>
        `;
    };

    blocklyDiv.style.position = 'absolute';
    blocklyDiv.style.top = '0';
    blocklyDiv.style.left = '0';
    blocklyDiv.style.width = '100%';
    blocklyDiv.style.height = '100%';

    class SoftConstantsProvider extends Blockly.blockRendering.ConstantProvider {
        constructor() {
            super();
            this.CORNER_RADIUS = 12; // Much softer, "squishy" feel
            this.NOTCH_WIDTH = 0;
            this.NOTCH_HEIGHT = 0;
            this.TAB_HEIGHT = 0;
            this.TAB_WIDTH = 0;
            this.STATEMENT_BOTTOM_SPACER = 0;
            this.STATEMENT_INPUT_PADDING_LEFT = 16;
            this.MIN_BLOCK_HEIGHT = 48; // Taller blocks for softer feel
            this.DUMMY_INPUT_MIN_HEIGHT = 48;
        }

        makeNotch() {
            return { type: 1, width: 0, height: 0, pathLeft: 'h 0', pathRight: 'h 0' };
        }

        makePuzzleTab() {
            return { type: 2, width: 0, height: 0, pathDown: 'v 0', pathUp: 'v 0' };
        }
    }

    class SoftDrawer extends Blockly.blockRendering.Drawer {
        drawTop_() {
            const hasOut = this.info_.hasOutputConnection;
            this.info_.hasOutputConnection = false;
            super.drawTop_();
            this.info_.hasOutputConnection = hasOut;
        }
        drawLeft_() {
            const hasOut = this.info_.hasOutputConnection;
            if (hasOut) this.positionOutputConnection_();
            this.info_.hasOutputConnection = false;
            super.drawLeft_();
            this.info_.hasOutputConnection = hasOut;
        }
        drawBottom_() {
            const hasOut = this.info_.hasOutputConnection;
            this.info_.hasOutputConnection = false;
            super.drawBottom_();
            this.info_.hasOutputConnection = hasOut;
        }
    }

    class SoftRenderer extends Blockly.blockRendering.Renderer {
        constructor(name) {
            super(name);
        }
        makeConstants_() {
            return new SoftConstantsProvider();
        }
        makeDrawer_(block, info) {
            return new SoftDrawer(block, info);
        }
    }

    Blockly.blockRendering.register('soft', SoftRenderer);

    const workspace = Blockly.inject(blocklyDiv, {
        toolbox: toolboxes.motion,
        scrollbars: true,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
        renderer: 'soft',
        theme: Blockly.Theme.defineTheme('arduinotheme', {
            base: Blockly.Themes.Classic,
            blockStyles: {
                motion_blocks: {
                    colourPrimary: '#4d97ff',
                    colourSecondary: '#2b6fd4',
                    colourTertiary: '#1a4fa0'
                },
                control_blocks: {
                    colourPrimary: '#ffab19',
                    colourSecondary: '#d4850a',
                    colourTertiary: '#a06000'
                },
                logic_blocks: {
                    colourPrimary: '#ffab19',
                    colourSecondary: '#d4850a',
                    colourTertiary: '#a06000'
                },
                sensing_blocks: {
                    colourPrimary: '#5cb1d6',
                    colourSecondary: '#3a8aad',
                    colourTertiary: '#1e6080'
                },
                math_blocks: {
                    colourPrimary: '#5cb1d6',
                    colourSecondary: '#3a8aad',
                    colourTertiary: '#1e6080'
                },
                loop_blocks: {
                    colourPrimary: '#ffca1a',
                    colourSecondary: '#e0ad00',
                    colourTertiary: '#b38a00'
                }
            },
            categoryStyles: {},
            componentStyles: {
                workspaceBackgroundColour: '#121420',
                toolboxBackgroundColour: '#1e2136',
                toolboxForegroundColour: '#fff',
                flyoutBackgroundColour: '#1e2136',
                flyoutForegroundColour: '#ccc',
                flyoutOpacity: 1
            },
            fontStyle: {
                family: 'Nunito, sans-serif',
                weight: 'bold',
                size: 14
            }
        })
    });

    window.blocklyWorkspace = workspace;
    window.runMode = 'blocks';

    const hasBlocks = () => workspace.getAllBlocks(false).length > 0;

    const updateWatermark = () => {
        watermark.classList.toggle('hidden', window.runMode !== 'blocks' || hasBlocks());
    };

    const layoutActiveEditor = () => {
        if (window.runMode === 'python') {
            layoutPythonEditor();
        } else if (window.runMode === 'cpp') {
            layoutCppEditor();
        }
    };

    window.layoutActiveCodeEditor = layoutActiveEditor;

    const syncCodeFromWorkspace = () => {
        const pythonCode = Blockly.Python.workspaceToCode(workspace);
        const cppBody = window.cppGenerator ? window.cppGenerator.workspaceToCode(workspace) : '';

        syncPythonFromWorkspace(pythonCode);
        syncCppFromWorkspace(cppBody);

        window.generatedPython = getPythonSource();
        window.generatedCpp = getCppSource();
    };

    const setMode = async (mode) => {
        const previousMode = window.runMode;

        // Blocks → Python (after Python edits): offer choice
        if (previousMode === 'blocks' && mode === 'python' && isPythonEditorDirty()) {
            const { atEntry, userEdits } = stateManager.getPythonState();

            if (userEdits && userEdits !== atEntry) {
                const choice = await showModeDialog(
                    'Which Python code would you like to use?',
                    'You have both new blocks and previous edits.',
                    {
                        primary: { label: 'Use regenerated Python' },
                        secondary: { label: 'Use your previous edits' }
                    }
                );

                if (choice === 'cancel') return;

                window.runMode = mode;

                if (choice === 'secondary') {
                    syncPythonFromWorkspace(userEdits, { force: true });
                } else {
                    const pythonCode = Blockly.Python.workspaceToCode(workspace);
                    stateManager.savePythonState(pythonCode, pythonCode);
                }
            } else {
                window.runMode = mode;
                stateManager.saveBlocksXml(workspace);
                const pythonCode = Blockly.Python.workspaceToCode(workspace);
                stateManager.savePythonState(pythonCode, pythonCode);
            }
        }
        // Blocks → Python: save state
        else if (previousMode === 'blocks' && mode === 'python') {
            stateManager.saveBlocksXml(workspace);
            const pythonCode = Blockly.Python.workspaceToCode(workspace);
            stateManager.savePythonState(pythonCode, pythonCode);
            window.runMode = mode;
        }
        // Python → Blocks: offer restore choice
        else if (previousMode === 'python' && mode === 'blocks') {
            const hasSavedBlocks = stateManager.get().blocksXml;

            if (hasSavedBlocks) {
                const choice = await showModeDialog(
                    'Restore your blocks?',
                    'You have saved blocks from before entering Python mode.',
                    {
                        primary: { label: 'Restore blocks' },
                        secondary: { label: 'Start fresh' }
                    }
                );

                if (choice === 'cancel') return;

                window.runMode = mode;

                if (choice === 'primary') {
                    stateManager.loadBlocksXml(workspace);
                } else {
                    workspace.clear();
                }
            } else {
                window.runMode = mode;
            }
        }
        // Default: just switch
        else {
            window.runMode = mode;
        }

        blocklyDiv.classList.toggle('is-hidden', mode !== 'blocks');
        monacoEditor.classList.toggle('is-visible', mode !== 'blocks');
        pythonPane.classList.toggle('active', mode === 'python');
        cppPane.classList.toggle('active', mode === 'cpp');

        const solutionBtn = document.getElementById('solution-btn');
        const runBtn = document.getElementById('run-btn');

        if (mode !== 'blocks') {
            solutionBtn.disabled = true;
            solutionBtn.setAttribute('aria-disabled', 'true');
        } else {
            solutionBtn.disabled = false;
            solutionBtn.removeAttribute('aria-disabled');
        }

        if (mode === 'cpp') {
            runBtn.textContent = '▶ Preview';
            runBtn.style.background = '';
            runBtn.style.color = '';
            runBtn.style.borderColor = '';
        } else {
            runBtn.textContent = '▶ Run';
            runBtn.style.background = '';
            runBtn.style.color = '';
            runBtn.style.borderColor = '';
        }

        modeButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.mode === mode);
        });

        updateWatermark();

        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        requestAnimationFrame(() => {
            Blockly.svgResize(workspace);
            layoutActiveEditor();
        });
    };

    categoryButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            categoryButtons.forEach((categoryButton) => categoryButton.classList.remove('active'));
            const target = event.currentTarget;
            target.classList.add('active');
            workspace.updateToolbox(toolboxes[target.getAttribute('data-cat')]);
            renderDocs(target.getAttribute('data-cat'));
        });
    });

    modeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            void setMode(button.dataset.mode);
        });
    });

    window.addEventListener('resize', () => {
        Blockly.svgResize(workspace);
        layoutActiveEditor();
    }, false);

    document.getElementById('run-btn').addEventListener('click', async () => {
        clearConsole();
        
        // Reset car and runner state
        document.getElementById('reset-btn').click();

        if (window.runMode === 'blocks') {
            const code = Blockly.JavaScript.workspaceToCode(workspace);

            if (!code.trim()) {
                appendConsoleLine('Add some blocks first.');
                if (window.showToast) window.showToast('Add some blocks first!', 'error');
                return;
            }

            try {
                const asyncFn = new Function(`return (async () => { ${code} })();`);
                await asyncFn();
            } catch (error) {
                console.error(error);
                writeConsoleError(error);
                if (window.showToast) window.showToast('Error running code', 'error');
            }

            return;
        }

        if (window.runMode === 'python') {
            const source = getPythonSource();
            if (!source.trim()) {
                appendConsoleLine('Add some Python code first.');
                if (window.showToast) window.showToast('Add some Python code first!', 'error');
                return;
            }

            try {
                await runPythonEditor();
            } catch (error) {
                console.error(error);
                writeConsoleError(error);
                if (window.showToast) window.showToast(error.message || 'Error running Python code', 'error');
            }

            return;
        }

        if (window.runMode === 'cpp') {
            const source = getCppSource();
            if (!source.trim()) {
                appendConsoleLine('Add some C++ code first.');
                if (window.showToast) window.showToast('Add some C++ code first!', 'error');
                return;
            }

            appendConsoleLine('C++ mode is preview-only for now. The sketch is generated and highlighted, but it does not execute yet.');
            if (window.showToast) window.showToast('C++ mode is preview only', 'error');
        }
    });

    workspace.addChangeListener((event) => {
        if (event.type === Blockly.Events.BLOCK_CREATE) {
            updateWatermark();
        }

        if (event.isUiEvent) return;

        syncCodeFromWorkspace();
        updateWatermark();
    });

    // Settings dialog
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-dialog').showModal();
    });

    document.getElementById('settings-close').addEventListener('click', () => {
        document.getElementById('settings-dialog').close();
    });

    document.getElementById('solution-btn').addEventListener('click', () => {
        if (window.runMode !== 'blocks') {
            if (window.showToast) window.showToast('Solutions are only available in Blocks mode.', 'error');
            return;
        }
        const mission = getActiveMission();
        if (!mission) return;
        
        const xmlStr = MISSION_SOLUTIONS[mission.id];
        if (xmlStr) {
            if (confirm('Load the model solution? This will replace your current blocks.')) {
                workspace.clear();
                const xml = Blockly.utils.xml.textToDom(xmlStr);
                Blockly.Xml.domToWorkspace(xml, workspace);
                if (window.showToast) window.showToast('Model solution loaded!', 'success');
            }
        } else {
            if (window.showToast) window.showToast('No solution available for this mission.', 'error');
        }
    });

    document.getElementById('clear-state-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved state? This cannot be undone.')) {
            stateManager.clear();
            workspace.clear();
            document.getElementById('settings-dialog').close();
            if (window.showToast) window.showToast('All saved state cleared', 'success');
            setTimeout(() => location.reload(), 500);
        }
    });

    void initPythonEditor().catch((error) => console.error(error));
    void initCppEditor().catch((error) => console.error(error));

    const applyBlockLocking = () => {
        const level = getLevel();
        const allBlocks = workspace.getAllBlocks(false);
        allBlocks.forEach((block) => {
            const unlocked = isBlockUnlocked(block.type, level);
            if (typeof block.setEnabled === 'function') {
                block.setEnabled(unlocked);
            } else if (typeof block.setDisabled === 'function') {
                block.setDisabled(!unlocked);
            }
            if (!unlocked) {
                const unlockLevel = getUnlockLevel(block.type);
                block.setTooltip(`Unlocks at level ${unlockLevel}`);
            } else {
                block.setTooltip('');
            }
        });
    };

    applyBlockLocking();
    workspace.addChangeListener(() => applyBlockLocking());
    window.addEventListener('xp-changed', applyBlockLocking);

    syncCodeFromWorkspace();
    renderDocs('motion');
    void setMode('blocks');
}
