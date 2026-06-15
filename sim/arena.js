export class Arena {
    constructor(p, width, height, type = 'open') {
        this.p = p;
        this.width = 800;
        this.height = 500;
        this.padding = 10;
        
        if (typeof width === 'string') {
            this.type = width;
        } else {
            this.type = type;
        }
        
        if (this.type === 'turn_obstacle') {
            this.obstacles = [
                { x: 0, y: 200, w: 500, h: 50 }
            ];
        } else {
            this.obstacles = [
                { x: 200, y: 200, w: 80, h: 80 },
                { x: 500, y: 150, w: 60, h: 200 },
                { x: 350, y: 350, w: 100, h: 50 },
                { x: 600, y: 150, w: 200, h: 50 } // Block the right path so M3 solution fails
            ];
        }

        this.lineSegments = [
            { x1: 400, y1: 500, x2: 400, y2: 400 },
            { x1: 400, y1: 400, x2: 300, y2: 250 },
            { x1: 300, y1: 250, x2: 200, y2: 150 },
            { x1: 200, y1: 150, x2: 200, y2: 50 }
        ];
    }
    
    draw() {
        // Draw open arena background
        this.p.background(20, 22, 35);
        
        // Draw grid dots
        this.p.fill(255, 255, 255, 20);
        this.p.noStroke();
        for (let x = 0; x < this.width; x += 30) {
            for (let y = 0; y < this.height; y += 30) {
                this.p.circle(x, y, 2);
            }
        }
        
        if (this.type === 'line') {
            this.p.fill(20, 200, 50, 100);
            this.p.rect(150, 30, 100, 40); // Finish line

            this.p.noFill();
            this.p.stroke(200, 200, 200, 150);
            this.p.strokeWeight(60);
            this.p.strokeJoin(this.p.ROUND);
            this.p.beginShape();
            if (this.lineSegments && this.lineSegments.length > 0) {
                this.p.vertex(this.lineSegments[0].x1, this.lineSegments[0].y1);
                for (let seg of this.lineSegments) {
                    this.p.vertex(seg.x2, seg.y2);
                }
            }
            this.p.endShape();
        } 
        // Draw obstacles
        else if (this.type === 'obstacle' || this.type === 'turn_obstacle') {
            this.p.fill(200, 50, 50);
            this.p.noStroke();
            for (let obs of this.obstacles) {
                this.p.rect(obs.x, obs.y, obs.w, obs.h);
            }
        }
        
        // Finish line background
        this.p.fill(30, 200, 80, 50);
        this.p.rect(0, 20, this.width, 20);
        
        // Checkerboard finish line
        this.p.fill(74, 240, 154);
        for(let i=0; i<this.width; i+=20) {
            if ((i/20) % 2 === 0) {
                this.p.rect(i, 20, 10, 10);
                this.p.rect(i+10, 30, 10, 10);
            } else {
                this.p.rect(i+10, 20, 10, 10);
                this.p.rect(i, 30, 10, 10);
            }
        }

        // Start zone text
        this.p.fill(255, 255, 255, 50);
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(12);
        this.p.text("START", this.width / 2, this.height - 20);
        this.p.text("FINISH", this.width / 2, 15);
    }
    
    checkWall(x, y, w, h) {
        // basic boundary check with some padding
        const hw = h / 2; // the car's length is h (40) since it points along its longest side
        const hh = w / 2; // the car's width is w (24)
        // Note: When car rotates, bounding box changes, but simple circle collision is fine for walls
        const r = Math.max(w, h) / 2;
        return (x - r < 0 || x + r > this.width || y - r < 0 || y + r > this.height);
    }

    checkObstacle(x, y, w, h) {
        if (this.type !== 'obstacle' && this.type !== 'turn_obstacle') return false;
        const r = Math.max(w, h) / 2;
        for (let obs of this.obstacles) {
            let testX = x;
            let testY = y;
            
            if (x < obs.x) testX = obs.x;
            else if (x > obs.x + obs.w) testX = obs.x + obs.w;
            
            if (y < obs.y) testY = obs.y;
            else if (y > obs.y + obs.h) testY = obs.y + obs.h;
            
            let distX = x - testX;
            let distY = y - testY;
            let distance = Math.sqrt((distX*distX) + (distY*distY));
            
            if (distance <= r) {
                return true;
            }
        }
        return false;
    }
    
    checkFinish(carX, carY) {
        // The finish line visually ends at y=40. 
        // Since the car's center is y, and the front bumper is y-25, 
        // the bumper crosses the line when the center reaches y=65.
        return carY < 65;
    }
}
