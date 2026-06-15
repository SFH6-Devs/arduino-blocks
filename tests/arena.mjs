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
        
        this.obstacles = [
            { x: 200, y: 200, w: 80, h: 80 },
            { x: 500, y: 150, w: 60, h: 200 },
            { x: 350, y: 350, w: 100, h: 50 }
        ];

        this.lineSegments = [
            { x1: 400, y1: 500, x2: 400, y2: 350 },
            { x1: 400, y1: 350, x2: 600, y2: 350 },
            { x1: 600, y1: 350, x2: 600, y2: 150 },
            { x1: 600, y1: 150, x2: 200, y2: 150 },
            { x1: 200, y1: 150, x2: 200, y2: 50 },
            { x1: 200, y1: 50, x2: 400, y2: 50 }
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
        
        // Draw line track
        if (this.type === 'line') {
            this.p.stroke(255, 255, 255, 200);
            this.p.strokeWeight(20);
            for (let seg of this.lineSegments) {
                this.p.line(seg.x1, seg.y1, seg.x2, seg.y2);
            }
            this.p.noStroke();
        } 
        // Draw obstacles
        else if (this.type === 'obstacle') {
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
        if (this.type !== 'obstacle') return false;
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
        // Passed the finish line
        return carY < 40;
    }
}
