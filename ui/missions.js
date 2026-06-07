let missions = [];
let activeIndex = 0;

export async function loadMissions() {
    const res = await fetch('challenges/missions.json');
    missions = await res.json();
    renderMissionStrip();
    return missions;
}

export function getMissions() {
    return missions;
}

export function getActiveMission() {
    return missions[activeIndex] || null;
}

export function setActiveMission(id) {
    const idx = missions.findIndex((m) => m.id === id);
    if (idx !== -1) activeIndex = idx;
    renderMissionStrip();
}

export function cycleMission() {
    if (missions.length === 0) return;
    activeIndex = (activeIndex + 1) % missions.length;
    renderMissionStrip();
}

export function renderMissionStrip() {
    const strip = document.getElementById('mission-strip');
    if (!strip || missions.length === 0) return;

    const mission = missions[activeIndex];
    strip.textContent = '';
    strip.title = mission.description;

    const num = document.createElement('span');
    num.textContent = `Mission ${activeIndex + 1}`;
    strip.appendChild(num);

    const title = document.createTextNode(`: ${mission.title}`);
    strip.appendChild(title);

    strip.onclick = () => {
        cycleMission();
    };
}

export function showChallengeComplete(mission, xp) {
    const dialog = document.getElementById('challenge-complete-dialog');
    if (!dialog) return;

    document.getElementById('cc-mission-title').textContent = mission.title;
    document.getElementById('cc-xp-amount').textContent = `+${xp} XP`;
    document.getElementById('cc-description').textContent = mission.description;

    dialog.showModal();

    if (window.confetti) {
        const canvasBounds = document.getElementById('sim-canvas-container').getBoundingClientRect();
        const originX = (canvasBounds.left + canvasBounds.width / 2) / window.innerWidth;
        const originY = (canvasBounds.top + 50) / window.innerHeight;

        window.confetti({
            particleCount: 150,
            spread: 70,
            origin: { x: originX, y: originY },
            colors: ['#4af09a', '#4d97ff', '#ffca1a']
        });
    }
}
