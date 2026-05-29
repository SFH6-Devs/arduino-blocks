export class Car {
    constructor(x, y) {
        this.reset(x, y);
    }
    
    reset(x, y) {
        this.x = x || 200;
        this.y = y || 250;
        this.heading = -Math.PI / 2; // Pointing UP
        this.speedLevel = 5;
        this.action = null;
        this.width = 30;
        this.height = 50;
        this.crashed = false;
        this.trail = [];
        this.wheelSpin = 0; // for animation
    }

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
        if (this.action && this.action.resolve) this.action.resolve();
        this.action = null;
    }
    
    distance() { return 100; }
    onLine() { return false; }
    
    update(arena) {
        if (this.crashed) return; // Don't move if crashed

        // Leave trail
        if (performance.now() % 5 < 1) { // Throttle trail
            this.trail.push({x: this.x, y: this.y});
            if (this.trail.length > 30) this.trail.shift();
        }

        if (!this.action) return;
        
        const now = performance.now();
        const baseSpeed = (this.speedLevel * 0.4); 
        
        // Wheel animation
        if (this.action.type === 'forward' || this.action.type === 'back') {
            this.wheelSpin += baseSpeed;
        }
        
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
            this.crashed = true;
            if (window.showToast) window.showToast("Oops! You hit the wall!", "error");
            if (this.action.resolve) this.action.resolve();
            this.action = null;
        }
    }
    
    draw(p) {
        // Draw trail
        p.noFill();
        p.stroke(74, 240, 154, 50);
        p.strokeWeight(4);
        p.beginShape();
        this.trail.forEach(t => p.vertex(t.x, t.y));
        p.endShape();

        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.heading);

        // Visual sensor ray (ultrasonic cone)
        p.fill(255, 255, 255, 10);
        p.noStroke();
        p.arc(0, 0, 200, 200, -0.3, 0.3); // Cone forward

        if (this.crashed) {
            // Flash red
            if (Math.floor(performance.now() / 150) % 2 === 0) {
                p.fill(255, 50, 50);
            } else {
                p.fill(150, 0, 0);
            }
            p.stroke(255, 100, 100);
        } else {
            p.fill(40, 45, 60);
            p.stroke(100, 110, 150);
        }

        // Shadow
        p.push();
        p.translate(4, 4);
        p.fill(0, 0, 0, 80);
        p.noStroke();
        p.rectMode(p.CENTER);
        p.rect(0, 0, this.height, this.width, 6);
        p.pop();

        // Car body
        p.strokeWeight(2);
        p.rectMode(p.CENTER);
        p.rect(0, 0, this.height, this.width, 6);
        
        // Headlights (eyes!)
        p.fill(this.crashed ? [255,0,0] : [74, 240, 154]);
        p.noStroke();
        p.rect(this.height/2 - 2, -this.width/2 + 6, 6, 8, 3);
        p.rect(this.height/2 - 2, this.width/2 - 6, 6, 8, 3);
        
        // Wheels (animated)
        p.fill(20);
        const wOffset = Math.sin(this.wheelSpin) * 2;
        p.rect(-this.height/2 + 8, -this.width/2 - 3, 12, 6, 2);
        p.rect(this.height/2 - 8, -this.width/2 - 3, 12, 6, 2);
        p.rect(-this.height/2 + 8, this.width/2 + 3, 12, 6, 2);
        p.rect(this.height/2 - 8, this.width/2 + 3, 12, 6, 2);

        p.pop();
    }
}
