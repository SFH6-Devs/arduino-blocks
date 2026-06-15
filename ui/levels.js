const BLOCK_UNLOCK_LEVEL = {
    move_forward: 1,
    stop_car: 1,
    move_back: 2,
    turn_left: 2,
    turn_right: 2,
    set_speed: 3,
    wait: 3,
    distance: 4,
    if_obstacle: 4,
    controls_if: 4,
    logic_compare: 4,
    math_number: 4,
    on_line_left: 5,
    on_line_right: 5,
    set_motors: 5,
    if_on_line: 5,
    forever: 5,
    repeat_times: 5
};

export function isBlockUnlocked(blockType, level) {
    const required = BLOCK_UNLOCK_LEVEL[blockType];
    if (required === undefined) return true;
    return level >= required;
}

export function getUnlockedBlocks(level) {
    return Object.entries(BLOCK_UNLOCK_LEVEL)
        .filter(([, req]) => level >= req)
        .map(([type]) => type);
}

export function getUnlockLevel(blockType) {
    return BLOCK_UNLOCK_LEVEL[blockType] ?? 1;
}
