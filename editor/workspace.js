import { defineBlocks } from './blocks.js';
import { initGenerators } from './codegen.js';

export function initWorkspace() {
    defineBlocks();
    initGenerators();

    const toolboxes = {
        "motion": { "kind": "flyoutToolbox", "contents": [ { "kind": "block", "type": "move_forward" }, { "kind": "block", "type": "move_back" }, { "kind": "block", "type": "turn_left" }, { "kind": "block", "type": "turn_right" }, { "kind": "block", "type": "set_speed" }, { "kind": "block", "type": "stop_car" } ] },
        "control": { "kind": "flyoutToolbox", "contents": [ { "kind": "block", "type": "wait" }, { "kind": "block", "type": "if_obstacle" }, { "kind": "block", "type": "if_on_line" } ] },
        "sensing": { "kind": "flyoutToolbox", "contents": [ { "kind": "block", "type": "distance" }, { "kind": "block", "type": "on_line" } ] },
        "loops": { "kind": "flyoutToolbox", "contents": [ { "kind": "block", "type": "repeat_times" }, { "kind": "block", "type": "forever" } ] }
    };

    const blocklyDiv = document.getElementById('blockly-div');
    blocklyDiv.style.position = 'absolute';
    blocklyDiv.style.top = '0';
    blocklyDiv.style.left = '0';
    blocklyDiv.style.width = '100%';
    blocklyDiv.style.height = '100%';

    const workspace = Blockly.inject(blocklyDiv, {
        toolbox: toolboxes['motion'],
        scrollbars: true,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
        renderer: 'zelos',
        theme: Blockly.Theme.defineTheme('arduinotheme', {
            'base': Blockly.Themes.Classic,
            'blockStyles': {},
            'categoryStyles': {},
            'componentStyles': {
                'workspaceBackgroundColour': '#121420',
                'toolboxBackgroundColour': '#1e2136',
                'toolboxForegroundColour': '#fff',
                'flyoutBackgroundColour': '#1e2136',
                'flyoutForegroundColour': '#ccc',
                'flyoutOpacity': 1
            },
            'fontStyle': {
                'family': 'Outfit, sans-serif',
                'weight': 'bold',
                'size': 13
            }
        })
    });

    window.blocklyWorkspace = workspace;
    window.runMode = 'blocks';

    // Sidebar clicking
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            workspace.updateToolbox(toolboxes[target.getAttribute('data-cat')]);
        });
    });

    window.addEventListener('resize', () => Blockly.svgResize(workspace), false);

    // Run Logic
    document.getElementById('run-btn').addEventListener('click', async () => {
        if (window.runMode !== 'blocks') return;
        
        // Hide watermark if it's there (should be hidden by now, but just in case)
        document.getElementById('workspace-watermark').style.opacity = '0';
        
        const code = Blockly.JavaScript.workspaceToCode(workspace);
        
        if (!code.trim()) {
            if (window.showToast) window.showToast("Add some blocks first!", "error");
            return;
        }

        try {
            const asyncFn = new Function(`return (async () => { ${code} })();`);
            await asyncFn();
        } catch (e) {
            console.error(e);
            if (window.showToast) window.showToast("Error running code", "error");
        }
    });

    // Hide watermark when blocks are added
    workspace.addChangeListener((e) => {
        if (e.type === Blockly.Events.BLOCK_CREATE) {
            const wm = document.getElementById('workspace-watermark');
            if (wm) wm.style.opacity = '0';
        }
        if (e.isUiEvent) return;
        window.generatedPython = Blockly.Python.workspaceToCode(workspace);
    });
}
