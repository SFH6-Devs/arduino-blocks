export function distanceAhead(car, arena) {
    const step = 5;
    const maxDist = 300; // max ultrasonic range
    let cx = car.x;
    let cy = car.y;
    // Assuming heading is in radians
    let dx = Math.cos(car.heading) * step;
    let dy = Math.sin(car.heading) * step;
    
    for (let d = 0; d < maxDist; d += step) {
        cx += dx;
        cy += dy;
        // check wall
        if (arena.checkWall(cx, cy, 0, 0)) {
            return d;
        }
        // check obstacle
        if (arena.checkObstacle(cx, cy, 0, 0)) {
            return d;
        }
    }
    return maxDist;
}

function distToSegment(px, py, x1, y1, x2, y2) {
    let l2 = (x2 - x1)**2 + (y2 - y1)**2;
    if (l2 === 0) return Math.sqrt((px - x1)**2 + (py - y1)**2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    let projX = x1 + t * (x2 - x1);
    let projY = y1 + t * (y2 - y1);
    return Math.sqrt((px - projX)**2 + (py - projY)**2);
}

export function isOnLineLeft(car, arena) {
    if ((arena.type !== 'line' && arena.type !== 'line_sharp') || !arena.lineSegments) return false;
    const threshold = 30; 
    let sx = car.x + Math.cos(car.heading) * (car.height/2) + Math.cos(car.heading - Math.PI/2) * (car.width/2 - 4);
    let sy = car.y + Math.sin(car.heading) * (car.height/2) + Math.sin(car.heading - Math.PI/2) * (car.width/2 - 4);
    for (let seg of arena.lineSegments) {
        if (distToSegment(sx, sy, seg.x1, seg.y1, seg.x2, seg.y2) <= threshold) return true;
    }
    return false;
}

export function isOnLineRight(car, arena) {
    if ((arena.type !== 'line' && arena.type !== 'line_sharp') || !arena.lineSegments) return false;
    const threshold = 30; 
    let sx = car.x + Math.cos(car.heading) * (car.height/2) + Math.cos(car.heading + Math.PI/2) * (car.width/2 - 4);
    let sy = car.y + Math.sin(car.heading) * (car.height/2) + Math.sin(car.heading + Math.PI/2) * (car.width/2 - 4);
    for (let seg of arena.lineSegments) {
        if (distToSegment(sx, sy, seg.x1, seg.y1, seg.x2, seg.y2) <= threshold) return true;
    }
    return false;
}
