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
        this.lineTime = 0;
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
                return this.collisions === 0;
            case 'finish_with_turn':
                return this.turned;
            default:
                return false;
        }
    }

    getXPReward(mission, mode) {
        return mission.xp[mode] || mission.xp.blocks;
    }
}
