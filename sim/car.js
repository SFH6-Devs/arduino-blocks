import { distanceAhead, isOnLineLeft, isOnLineRight } from './sensors.js';

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
        this.motorL = 0; // -100 to 100
        this.motorR = 0; // -100 to 100
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

    setMotors(l, r) {
        this.motorL = Math.max(-100, Math.min(100, l));
        this.motorR = Math.max(-100, Math.min(100, r));
        // Cancel any pending discrete action
        if (this.action && this.action.resolve) this.action.resolve();
        this.action = null;
    }

    stop() {
        this.setMotors(0, 0);
    }
    
    distance() { return window.arena ? distanceAhead(this, window.arena) : 100; }
    onLineLeft() { return window.arena ? isOnLineLeft(this, window.arena) : false; }
    onLineRight() { return window.arena ? isOnLineRight(this, window.arena) : false; }
    
    update(arena) {
        if (this.crashed) return; // Don't move if crashed

        // Leave trail
        if (performance.now() % 5 < 1) { // Throttle trail
            this.trail.push({x: this.x, y: this.y});
            if (this.trail.length > 30) this.trail.shift();
        }

        let newX = this.x;
        let newY = this.y;
        const now = performance.now();

        const dtScale = (window.simP5 && window.simP5.deltaTime) ? (window.simP5.deltaTime / 16) : 1;

        if (this.action) {
            const baseSpeed = (this.speedLevel * 0.4) * dtScale; 
            
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
            } else {
                if (this.action.type === 'forward') {
                    newX += Math.cos(this.heading) * baseSpeed;
                    newY += Math.sin(this.heading) * baseSpeed;
                } else if (this.action.type === 'back') {
                    newX -= Math.cos(this.heading) * baseSpeed;
                    newY -= Math.sin(this.heading) * baseSpeed;
                } else if (this.action.type.startsWith('turn')) {
                    const progress = 1 - ((this.action.endTime - now) / this.action.totalTime);
                    this.heading = this.action.startHeading + (this.action.targetHeading - this.action.startHeading) * progress;
                }
            }
        } else if (this.motorL !== 0 || this.motorR !== 0) {
            // Continuous differential drive
            const maxSpeed = 3.0 * dtScale;
            const vl = (this.motorL / 100) * maxSpeed;
            const vr = (this.motorR / 100) * maxSpeed;
            
            // Average speed gives forward motion
            const v = (vl + vr) / 2;
            newX += Math.cos(this.heading) * v;
            newY += Math.sin(this.heading) * v;
            
            // Difference in speed gives rotation
            const trackWidth = 30; // distance between wheels
            const omega = (vr - vl) / trackWidth;
            this.heading += omega;
            
            this.wheelSpin += v;
        } else {
            return; // no action and no motors
        }

        // Check collision
        const hitWall = arena.checkWall(newX, newY, this.width, this.height);
        const hitObstacle = (arena.type === 'obstacle' || arena.type === 'line') && arena.checkObstacle && arena.checkObstacle(newX, newY, this.width, this.height);
        
        if (!hitWall && !hitObstacle) {
            this.x = newX;
            this.y = newY;
        } else {
            this.crashed = true;
            if (window.showToast) window.showToast(hitObstacle ? "Oops! You hit an obstacle!" : "Oops! You hit the wall!", "error");
            if (this.action && this.action.resolve) this.action.resolve();
            this.action = null;
            this.setMotors(0, 0);
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
