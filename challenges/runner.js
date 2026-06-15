export class MissionRunner {
    constructor() {
        this.reset();
    }

    reset() {
        this.collisions = 0;
        this.turned = false;
        this.lineTime = 0;
        this.finished = false;
    }

    onCollision() {
        this.collisions++;
    }

    onTurn() {
        this.turned = true;
    }

    onLineTick(dt) {
        this.lineTime += dt;
    }

    offLine() {
        // lineTime accumulates — don't reset on momentary line loss
    }

    onFinish() {
        this.finished = true;
    }

    checkPass(mission) {
        if (!this.finished) return false;

        switch (mission.pass) {
            case 'reach_finish':
                return true;
            case 'finish_no_collisions':
            case 'finish_stopped':
                return this.collisions === 0;
            case 'finish_with_turn':
                return this.turned;
            case 'on_line_5s':
                return this.lineTime >= 5000;
            case 'finish_and_on_line':
                return this.lineTime >= 5000 && this.collisions === 0;
            default:
                return false;
        }
    }

    getXPReward(mission, mode) {
        return mission.xp[mode] || mission.xp.blocks;
    }
}
