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

export function nextMission() {
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

    renderMissionHint(mission);
}

function renderMissionHint(mission) {
    const hintEl = document.getElementById('mission-hint');
    if (!hintEl) return;

    hintEl.textContent = '';

    const desc = document.createElement('span');
    desc.className = 'hint-description';
    desc.textContent = mission.description;
    hintEl.appendChild(desc);

    if (mission.hints && mission.hints.length > 0) {
        const blocks = document.createElement('span');
        blocks.className = 'hint-blocks';
        blocks.textContent = `Try: ${mission.hints.join(', ')}`;
        hintEl.appendChild(blocks);
    }
}

export function showChallengeComplete(mission, xp) {
    const dialog = document.getElementById('challenge-complete-dialog');
    if (!dialog) return;

    document.getElementById('cc-mission-title').textContent = mission.title;
    document.getElementById('cc-xp-amount').textContent = `+${xp} XP`;
    document.getElementById('cc-description').textContent = mission.description;

    const nextBtn = document.getElementById('cc-next');
    if (nextBtn) {
        nextBtn.onclick = () => {
            dialog.close();
            nextMission();
        };
    }

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

export function showMissionFailed(failMsg) {
    if (window.showToast) {
        window.showToast(failMsg || 'Mission not passed. Try again!', 'error');
    }
}
