export function defineBlocks() {
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "start_mission",
            "message0": "🚦 when ▶ clicked",
            "nextStatement": null,
            "style": "motion_blocks",
            "tooltip": "The starting point for your mission code."
        },
        {
            "type": "move_forward",
            "message0": "⬆️ move forward %1 ms",
            "args0": [{ "type": "field_number", "name": "TIME", "value": 1000 }],
            "previousStatement": null,
            "nextStatement": null,
            "style": "motion_blocks",
            "tooltip": "Move the car forward for a specific time."
        },
        {
            "type": "move_back",
            "message0": "⬇️ move back %1 ms",
            "args0": [{ "type": "field_number", "name": "TIME", "value": 1000 }],
            "previousStatement": null,
            "nextStatement": null,
            "style": "motion_blocks"
        },
        {
            "type": "turn_left",
            "message0": "↰ turn left %1 degrees",
            "args0": [{ "type": "field_number", "name": "DEGREES", "value": 90 }],
            "previousStatement": null,
            "nextStatement": null,
            "style": "motion_blocks"
        },
        {
            "type": "turn_right",
            "message0": "↱ turn right %1 degrees",
            "args0": [{ "type": "field_number", "name": "DEGREES", "value": 90 }],
            "previousStatement": null,
            "nextStatement": null,
            "style": "motion_blocks"
        },
        {
            "type": "set_speed",
            "message0": "⚡ set speed %1",
            "args0": [{ "type": "field_number", "name": "SPEED", "value": 5, "min": 1, "max": 10 }],
            "previousStatement": null,
            "nextStatement": null,
            "style": "motion_blocks"
        },
        {
            "type": "stop_car",
            "message0": "🟥 stop",
            "previousStatement": null,
            "nextStatement": null,
            "style": "motion_blocks"
        },
        {
            "type": "wait",
            "message0": "⏳ wait %1 ms",
            "args0": [{ "type": "field_number", "name": "TIME", "value": 1000 }],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks"
        },
        {
            "type": "if_obstacle",
            "message0": "🚧 if obstacle ahead %1 %2",
            "args0": [
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "DO" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks"
        },
        {
            "type": "if_on_line",
            "message0": "〰️ if on line %1 %2",
            "args0": [
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "DO" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks"
        },
        {
            "type": "if_simple",
            "message0": "❓ if %1 then %2 %3",
            "args0": [
                { "type": "input_value", "name": "IF0", "check": "Boolean" },
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "DO0" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks"
        },
        {
            "type": "if_else",
            "message0": "❓ if %1 then %2 %3 else %4 %5",
            "args0": [
                { "type": "input_value", "name": "IF0", "check": "Boolean" },
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "DO0" },
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "ELSE" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks"
        },
        {
            "type": "distance",
            "message0": "📏 distance",
            "output": null,
            "style": "sensing_blocks"
        },
        {
            "type": "set_motors",
            "message0": "⚙️ set motors L %1 % R %2 %",
            "args0": [
                { "type": "field_number", "name": "SPEED_L", "value": 50, "min": -100, "max": 100 },
                { "type": "field_number", "name": "SPEED_R", "value": 50, "min": -100, "max": 100 }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "motion_blocks"
        },
        {
            "type": "on_line_left",
            "message0": "👁️ Left on line?",
            "output": null,
            "style": "sensing_blocks"
        },
        {
            "type": "on_line_right",
            "message0": "👁️ Right on line?",
            "output": null,
            "style": "sensing_blocks"
        },
        {
            "type": "repeat_times",
            "message0": "🔁 repeat %1 times %2 %3",
            "args0": [
                { "type": "field_number", "name": "TIMES", "value": 4 },
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "DO" }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "loop_blocks"
        },
        {
            "type": "forever",
            "message0": "♾️ forever %1 %2",
            "args0": [
                { "type": "input_dummy" },
                { "type": "input_statement", "name": "DO" }
            ],
            "previousStatement": null,
            "style": "loop_blocks"
        }
    ]);
}
