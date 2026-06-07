const STORAGE_KEY = 'arduinosim_xp';

const LEVELS = [
    { level: 1, xp: 0 },
    { level: 2, xp: 50 },
    { level: 3, xp: 150 },
    { level: 4, xp: 300 },
    { level: 5, xp: 500 },
    { level: 6, xp: 800 },
    { level: 7, xp: 1200 }
];

let currentXP = 0;
let currentLevel = 1;

function calcLevel(xp) {
    let lvl = 1;
    for (const entry of LEVELS) {
        if (xp >= entry.xp) lvl = entry.level;
    }
    return lvl;
}

function nextLevelXP(level) {
    const entry = LEVELS.find((e) => e.level === level + 1);
    return entry ? entry.xp : null;
}

function prevLevelXP(level) {
    const entry = LEVELS.find((e) => e.level === level);
    return entry ? entry.xp : 0;
}

export function loadXP() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        currentXP = data?.xp || 0;
    } catch {
        currentXP = 0;
    }
    currentLevel = calcLevel(currentXP);
    updateXPBar();
}

export function saveXP() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp: currentXP, level: currentLevel }));
}

export function addXP(amount) {
    currentXP += amount;
    currentLevel = calcLevel(currentXP);
    saveXP();
    updateXPBar();
    return { xp: currentXP, level: currentLevel, leveledUp: currentLevel > (calcLevel(currentXP - amount)) };
}

export function getXP() {
    return currentXP;
}

export function getLevel() {
    return currentLevel;
}

export function getLevelThresholds() {
    return LEVELS;
}

export function xpForNextLevel() {
    return nextLevelXP(currentLevel);
}

export function xpProgress() {
    const base = prevLevelXP(currentLevel);
    const target = nextLevelXP(currentLevel);
    if (target === null) return 1;
    return (currentXP - base) / (target - base);
}

export function updateXPBar() {
    const progress = document.getElementById('xp-progress');
    const text = document.getElementById('xp-text');
    if (!progress || !text) return;

    const pct = Math.min(xpProgress() * 100, 100);
    progress.style.width = `${pct}%`;

    const nextXP = xpForNextLevel();
    text.textContent = nextXP !== null
        ? `${currentXP} / ${nextXP} XP — Level ${currentLevel}`
        : `${currentXP} XP — Level ${currentLevel} (max)`;
}

export function clearXP() {
    currentXP = 0;
    currentLevel = 1;
    localStorage.removeItem(STORAGE_KEY);
    updateXPBar();
}
