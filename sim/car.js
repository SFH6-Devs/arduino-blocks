export class Car {
    constructor(x, y) {
        this.reset(x, y);
    }
    
    reset(x, y) {
        this.x = x || 200;
        this.y = y || 250;
        this.heading = -Math.PI / 2; // Pointing UP (in canvas Y goes down)
        this.speedLevel = 5; // 1-10
        this.action = null; // { type, endTime, resolve }
        this.width = 24;
        this.height = 40;
    }

    // Public API - returns Promise to allow awaiting in async code
    forward(time) {
        return new Promise(resolve => {
            this.action = { type: 'forward', endTime: performance.now() + time, resolve };
        });
    }

    back(time) {
        return new Promise(resolve => {
            this.action = { type: 'back', endTime: performance.now() + time, resolve };
        });
    }

    turnLeft(deg) {
        return new Promise(resolve => {
            const turnTime = (deg / 90) * (1000 / this.speedLevel);
            const targetHeading = this.heading - deg * (Math.PI / 180);
            this.action = { type: 'turnLeft', endTime: performance.now() + turnTime, targetHeading, startHeading: this.heading, totalTime: turnTime, resolve };
        });
    }

    turnRight(deg) {
        return new Promise(resolve => {
            const turnTime = (deg / 90) * (1000 / this.speedLevel);
            const targetHeading = this.heading + deg * (Math.PI / 180);
            this.action = { type: 'turnRight', endTime: performance.now() + turnTime, targetHeading, startHeading: this.heading, totalTime: turnTime, resolve };
        });
    }

    setSpeed(n) {
        this.speedLevel = Math.max(1, Math.min(10, n));
    }

    stop() {
        if (this.action && this.action.resolve) {
            this.action.resolve();
        }
        this.action = null;
    }
    
    distance() { return 100; /* stub for now */ }
    onLine() { return false; /* stub */ }
    
    update(arena) {
        if (!this.action) return;
        
        const now = performance.now();
        const baseSpeed = (this.speedLevel * 0.3); // Pixels per frame multiplier
        
        if (now >= this.action.endTime) {
            if (this.action.type.startsWith('turn')) {
                this.heading = this.action.targetHeading;
            }
            if (this.action.resolve) this.action.resolve();
            this.action = null;
            return;
        }
        
        let newX = this.x;
        let newY = this.y;

        if (this.action.type === 'forward') {
            newX += Math.cos(this.heading) * baseSpeed;
            newY += Math.sin(this.heading) * baseSpeed;
        } else if (this.action.type === 'back') {
            newX -= Math.cos(this.heading) * baseSpeed;
            newY -= Math.sin(this.heading) * baseSpeed;
        } else if (this.action.type === 'turnLeft' || this.action.type === 'turnRight') {
            const progress = 1 - ((this.action.endTime - now) / this.action.totalTime);
            this.heading = this.action.startHeading + (this.action.targetHeading - this.action.startHeading) * progress;
        }

        // Check collision
        if (!arena.checkWall(newX, newY, this.width, this.height)) {
            this.x = newX;
            this.y = newY;
        } else {
            console.log("Collision detected!");
            document.getElementById('console-output').textContent += "\nCollision detected!";
            if (this.action.resolve) this.action.resolve();
            this.action = null; // Stop on collision
        }
    }
    
    draw(p) {
        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.heading);
        
        // Shadow
        p.fill(0, 0, 0, 50);
        p.noStroke();
        p.rectMode(p.CENTER);
        p.rect(3, 3, this.height, this.width, 4);

        // Car body
        p.fill(40, 45, 60);
        p.stroke(100, 110, 150);
        p.strokeWeight(1.5);
        p.rect(0, 0, this.height, this.width, 4);
        
        // Front indicator/headlights
        p.fill(74, 240, 154); // neon green accent
        p.noStroke();
        p.rect(this.height/2 - 2, -this.width/2 + 4, 4, 6, 2);
        p.rect(this.height/2 - 2, this.width/2 - 4, 4, 6, 2);
        
        // Wheels
        p.fill(20);
        p.rect(-this.height/2 + 6, -this.width/2 - 2, 10, 4, 1);
        p.rect(this.height/2 - 6, -this.width/2 - 2, 10, 4, 1);
        p.rect(-this.height/2 + 6, this.width/2 + 2, 10, 4, 1);
        p.rect(this.height/2 - 6, this.width/2 + 2, 10, 4, 1);

        p.pop();
    }
}
