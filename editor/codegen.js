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
        const branch = generator.statementToCode(block, 'DO');
        return `if (window.car.distance() < 20) {\n${branch}}\n`;
    };
    js.forBlock['if_on_line'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO');
        return `if (window.car.onLine()) {\n${branch}}\n`;
    };
    js.forBlock['distance'] = function(block) {
        return ['window.car.distance()', js.ORDER_ATOMIC];
    };
    js.forBlock['on_line'] = function(block) {
        return ['window.car.onLine()', js.ORDER_ATOMIC];
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
        const branch = generator.statementToCode(block, 'DO') || '    pass\n';
        return `if car.distance() < 20:\n${branch}`;
    };
    py.forBlock['if_on_line'] = function(block, generator) {
        const branch = generator.statementToCode(block, 'DO') || '    pass\n';
        return `if car.on_line():\n${branch}`;
    };
    py.forBlock['distance'] = function(block) {
        return ['car.distance()', py.ORDER_ATOMIC];
    };
    py.forBlock['on_line'] = function(block) {
        return ['car.on_line()', py.ORDER_ATOMIC];
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
        return `if (car.onLine()) {\n${branch}}\n`;
    };
    cpp.forBlock['distance'] = function(block) {
        return ['car.distance()', cpp.ORDER_ATOMIC];
    };
    cpp.forBlock['on_line'] = function(block) {
        return ['car.onLine()', cpp.ORDER_ATOMIC];
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
}
