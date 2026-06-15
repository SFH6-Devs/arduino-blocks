export function initGenerators() {
    const js = Blockly.JavaScript;
    const py = Blockly.Python;
    const cpp = new Blockly.CodeGenerator('Cpp');

    py.INDENT = '    ';
    cpp.INDENT = '    ';
    cpp.ORDER_ATOMIC = 0;
    cpp.ORDER_NONE = 99;
    cpp.scrubNakedValue = (line) => `${line};\n`;

    const indentLines = (code, indent = '    ') => {
        return code.split('\n').map((line) => (line ? `${indent}${line}` : line)).join('\n');
    };

    const buildCppSketch = (body) => {
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
            normalizedBody.trimEnd(),
            '}',
            ''
        ].join('\n');
    };

    window.cppGenerator = cpp;
    window.buildCppSketch = buildCppSketch;
    
    // JS Generators (for browser execution)
    js.forBlock['move_forward'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `await window.car.forward(${time});\n`;
    };
    js.forBlock['move_back'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `await window.car.back(${time});\n`;
    };
    js.forBlock['turn_left'] = function(block) {
        const deg = block.getFieldValue('DEGREES');
        return `await window.car.turnLeft(${deg});\n`;
    };
    js.forBlock['turn_right'] = function(block) {
        const deg = block.getFieldValue('DEGREES');
        return `await window.car.turnRight(${deg});\n`;
    };
    js.forBlock['set_speed'] = function(block) {
        const speed = block.getFieldValue('SPEED');
        return `window.car.setSpeed(${speed});\n`;
    };
    js.forBlock['stop_car'] = function(block) {
        return `window.car.stop();\n`;
    };
    js.forBlock['wait'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `await new Promise(r => setTimeout(r, ${time}));\n`;
    };
    js.forBlock['if_obstacle'] = function(block, generator) {
        var branch = generator.statementToCode(block, 'DO');
        return `if (window.car.distance() < 50) {\n${branch}}\n`;
    };
    js.forBlock['if_on_line'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `if (window.car.onLineLeft() || window.car.onLineRight()) {\n${branch}}\n`;
    };
    js.forBlock['if_simple'] = function(block, generator) {
        const cond = generator.valueToCode(block, 'IF0', js.ORDER_NONE) || 'false';
        const branch0 = generator.statementToCode(block, 'DO0');
        return `if (${cond}) {\n${branch0}}\n`;
    };
    js.forBlock['if_else'] = function(block, generator) {
        const cond = generator.valueToCode(block, 'IF0', js.ORDER_NONE) || 'false';
        const branch0 = generator.statementToCode(block, 'DO0');
        const branch1 = generator.statementToCode(block, 'ELSE');
        return `if (${cond}) {\n${branch0}} else {\n${branch1}}\n`;
    };
    js.forBlock['distance'] = function(block) {
        return ['window.car.distance()', js.ORDER_ATOMIC];
    };
    js.forBlock['on_line_left'] = function(block) {
        return ['window.car.onLineLeft()', js.ORDER_ATOMIC];
    };
    js.forBlock['on_line_right'] = function(block) {
        return ['window.car.onLineRight()', js.ORDER_ATOMIC];
    };
    js.forBlock['set_motors'] = function(block) {
        const l = block.getFieldValue('SPEED_L');
        const r = block.getFieldValue('SPEED_R');
        return `window.car.setMotors(${l}, ${r});\n`;
    };
    js.forBlock['repeat_times'] = function(block, generator) {
        const times = block.getFieldValue('TIMES');
        const branch = generator.statementToCode(block, 'DO');
        return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
    };
    js.forBlock['forever'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `while (true) {\n${branch} await new Promise(r => setTimeout(r, 10));\n}\n`;
    };

    // Python Generators (for display and eventual Pyodide execution)
    py.forBlock['move_forward'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `await car.forward(${time})\n`;
    };
    py.forBlock['move_back'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `await car.back(${time})\n`;
    };
    py.forBlock['turn_left'] = function(block) {
        const deg = block.getFieldValue('DEGREES');
        return `await car.turn_left(${deg})\n`;
    };
    py.forBlock['turn_right'] = function(block) {
        const deg = block.getFieldValue('DEGREES');
        return `await car.turn_right(${deg})\n`;
    };
    py.forBlock['set_speed'] = function(block) {
        const speed = block.getFieldValue('SPEED');
        return `car.set_speed(${speed})\n`;
    };
    py.forBlock['stop_car'] = function(block) {
        return `car.stop()\n`;
    };
    py.forBlock['wait'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `await sleep(${time / 1000})\n`;
    };
    py.forBlock['if_obstacle'] = function(block, generator) {
        var branch = generator.statementToCode(block, 'DO') || '  pass\n';
        return `if car.distance() < 50:\n${branch}`;
    };
    py.forBlock['if_on_line'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO') || '    pass\n';
        return `if car.on_line_left() or car.on_line_right():\n${branch}`;
    };
    py.forBlock['if_simple'] = function(block, generator) {
        const cond = generator.valueToCode(block, 'IF0', py.ORDER_NONE) || 'False';
        const branch0 = generator.statementToCode(block, 'DO0') || '    pass\n';
        return `if ${cond}:\n${branch0}`;
    };
    py.forBlock['if_else'] = function(block, generator) {
        const cond = generator.valueToCode(block, 'IF0', py.ORDER_NONE) || 'False';
        const branch0 = generator.statementToCode(block, 'DO0') || '    pass\n';
        const branch1 = generator.statementToCode(block, 'ELSE') || '    pass\n';
        return `if ${cond}:\n${branch0}else:\n${branch1}`;
    };
    py.forBlock['distance'] = function(block) {
        return ['car.distance()', py.ORDER_ATOMIC];
    };
    py.forBlock['on_line_left'] = function(block) {
        return ['car.on_line_left()', py.ORDER_ATOMIC];
    };
    py.forBlock['on_line_right'] = function(block) {
        return ['car.on_line_right()', py.ORDER_ATOMIC];
    };
    py.forBlock['set_motors'] = function(block) {
        const l = block.getFieldValue('SPEED_L');
        const r = block.getFieldValue('SPEED_R');
        return `car.set_motors(${l}, ${r})\n`;
    };
    py.forBlock['repeat_times'] = function(block, generator) {
        const times = block.getFieldValue('TIMES');
        const branch = generator.statementToCode(block, 'DO') || '    pass\n';
        return `for i in range(${times}):\n${branch}`;
    };
    py.forBlock['forever'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO') || '    pass\n';
        return `while True:\n${branch}    await sleep(0.01)\n`;
    };

    cpp.forBlock['move_forward'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `car.forward(${time});\n`;
    };
    cpp.forBlock['move_back'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `car.back(${time});\n`;
    };
    cpp.forBlock['turn_left'] = function(block) {
        const deg = block.getFieldValue('DEGREES');
        return `car.turnLeft(${deg});\n`;
    };
    cpp.forBlock['turn_right'] = function(block) {
        const deg = block.getFieldValue('DEGREES');
        return `car.turnRight(${deg});\n`;
    };
    cpp.forBlock['set_speed'] = function(block) {
        const speed = block.getFieldValue('SPEED');
        return `car.setSpeed(${speed});\n`;
    };
    cpp.forBlock['stop_car'] = function(block) {
        return 'car.stop();\n';
    };
    cpp.forBlock['wait'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `delay(${time});\n`;
    };
    cpp.forBlock['if_obstacle'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO') || '    // no-op\n';
        return `if (car.distance() < 20) {\n${branch}}\n`;
    };
    cpp.forBlock['if_on_line'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO') || '    // no-op\n';
        return `if (car.onLineLeft() || car.onLineRight()) {\n${branch}}\n`;
    };
    cpp.forBlock['if_simple'] = function(block, generator) {
        const cond = generator.valueToCode(block, 'IF0', cpp.ORDER_NONE) || 'false';
        const branch0 = generator.statementToCode(block, 'DO0') || '    // no-op\n';
        return `if (${cond}) {\n${branch0}}\n`;
    };
    cpp.forBlock['if_else'] = function(block, generator) {
        const cond = generator.valueToCode(block, 'IF0', cpp.ORDER_NONE) || 'false';
        const branch0 = generator.statementToCode(block, 'DO0') || '    // no-op\n';
        const branch1 = generator.statementToCode(block, 'ELSE') || '    // no-op\n';
        return `if (${cond}) {\n${branch0}} else {\n${branch1}}\n`;
    };
    cpp.forBlock['distance'] = function(block) {
        return ['car.distance()', cpp.ORDER_ATOMIC];
    };
    cpp.forBlock['on_line_left'] = function(block) {
        return ['car.onLineLeft()', cpp.ORDER_ATOMIC];
    };
    cpp.forBlock['on_line_right'] = function(block) {
        return ['car.onLineRight()', cpp.ORDER_ATOMIC];
    };
    cpp.forBlock['set_motors'] = function(block) {
        const l = block.getFieldValue('SPEED_L');
        const r = block.getFieldValue('SPEED_R');
        return `car.setMotors(${l}, ${r});\n`;
    };
    cpp.forBlock['repeat_times'] = function(block, generator) {
        const times = block.getFieldValue('TIMES');
        const branch = generator.statementToCode(block, 'DO') || '    // no-op\n';
        return `for (int i = 0; i < ${times}; ++i) {\n${branch}}\n`;
    };
    cpp.forBlock['forever'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO') || '    // no-op\n';
        return `while (true) {\n${branch}}\n`;
    };

    cpp.forBlock['math_number'] = function(block) {
        return [String(Number(block.getFieldValue('NUM'))), cpp.ORDER_ATOMIC];
    };

    cpp.forBlock['logic_compare'] = function(block, generator) {
        const OPERATORS = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
        const operator = OPERATORS[block.getFieldValue('OP')];
        const argument0 = generator.valueToCode(block, 'A', cpp.ORDER_NONE) || '0';
        const argument1 = generator.valueToCode(block, 'B', cpp.ORDER_NONE) || '0';
        return [argument0 + ' ' + operator + ' ' + argument1, cpp.ORDER_NONE];
    };

    cpp.forBlock['controls_if'] = function(block, generator) {
        let n = 0;
        let code = '', branchCode, conditionCode;
        do {
            conditionCode = generator.valueToCode(block, 'IF' + n, cpp.ORDER_NONE) || 'false';
            branchCode = generator.statementToCode(block, 'DO' + n) || '    // no-op\n';
            code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' + branchCode + '}';
            ++n;
        } while (block.getInput('IF' + n));
        
        if (block.getInput('ELSE')) {
            branchCode = generator.statementToCode(block, 'ELSE') || '    // no-op\n';
            code += ' else {\n' + branchCode + '}';
        }
        return code + '\n';
    };
}
