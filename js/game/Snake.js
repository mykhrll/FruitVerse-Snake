// ============================================
// Snake — Main snake entity
// Equivalent to Java Snake class
// Body is composition (Snake *◆ Body segments)
// ============================================

export class Snake {
    constructor(startX, startY, skinColor = '#4caf50', shape = 'round') {
        // Body: array of {x, y} — head is index 0
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY },
        ];
        this.dx = 1;
        this.dy = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.coins = 0;
        this.skinColor = skinColor;
        this.shape = shape;
        this.alive = true;
        this.ghostMode = false;
    }

    setDirection(dx, dy) {
        // Prevent 180° reversal
        if (this.dx === -dx && this.dy === -dy) return;
        if (dx === 0 && dy === 0) return;
        this.dx = dx;
        this.dy = dy;
    }

    move() {
        const head = this.body[0];
        const newHead = { x: head.x + this.dx, y: head.y + this.dy };
        this.body.unshift(newHead);
        this.body.pop();
    }

    grow() {
        const tail = this.body[this.body.length - 1];
        this.body.push({ x: tail.x, y: tail.y });
    }

    takeDamage(dmg) {
        this.health = Math.max(0, this.health - dmg);
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    heal(val) {
        this.health = Math.min(this.maxHealth, this.health + val);
    }

    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === head.x && this.body[i].y === head.y) {
                return true;
            }
        }
        return false;
    }

    getHead() {
        return this.body[0];
    }

    isAt(x, y) {
        return this.body.some(seg => seg.x === x && seg.y === y);
    }

    draw(ctx, cellSize, skinDef) {
        const colors = skinDef ? skinDef.colors : [this.skinColor, this.skinColor];
        const shape = this.shape;

        for (let i = this.body.length - 1; i >= 0; i--) {
            const seg = this.body[i];
            const px = seg.x * cellSize;
            const py = seg.y * cellSize;
            const isHead = (i === 0);

            // Gradient color from head to tail
            const t = this.body.length > 1 ? i / (this.body.length - 1) : 0;
            let color;
            if (colors[0] === 'rainbow') {
                // HSL Rainbow: Hue from 0 (Red) to 360 (Red again), mapped over length
                const hue = (Date.now() / 10 + i * 15) % 360;
                color = `hsl(${hue}, 100%, 50%)`;
            } else {
                color = isHead ? colors[0] : this._lerpColor(colors[0], colors[1] || colors[0], t);
            }

            ctx.fillStyle = color;

            // Ghost mode visual
            if (this.ghostMode) {
                ctx.globalAlpha = 0.5 + 0.2 * Math.sin(Date.now() * 0.005 + i);
            }

            if (shape === 'round') {
                ctx.beginPath();
                ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
            } else if (shape === 'square') {
                ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            } else if (shape === 'diamond') {
                ctx.save();
                ctx.translate(px + cellSize / 2, py + cellSize / 2);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-cellSize / 3, -cellSize / 3, cellSize * 2 / 3, cellSize * 2 / 3);
                ctx.restore();
            } else if (shape === 'leaf') {
                ctx.beginPath();
                ctx.moveTo(px + cellSize/2, py + 1);
                ctx.quadraticCurveTo(px + cellSize - 1, py + cellSize/2, px + cellSize/2, py + cellSize - 1);
                ctx.quadraticCurveTo(px + 1, py + cellSize/2, px + cellSize/2, py + 1);
                ctx.fill();
            } else if (shape === 'neon_glow') {
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Default round
                ctx.beginPath();
                ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Head details (Eyes and Tongue)
            if (isHead) {
                this._drawHeadDetails(ctx, px, py, cellSize);
            }

            ctx.globalAlpha = 1;
        }
    }

    _drawHeadDetails(ctx, px, py, cs) {
        const eyeSize = cs * 0.15;
        const headCx = px + cs/2;
        const headCy = py + cs/2;
        
        // Tongue animation based on time
        const time = Date.now();
        const flick = (time % 1000 < 200) ? 1 : 0; // flick out for 200ms every second
        const tongueLength = cs * 0.4 * flick;
        
        ctx.save();
        ctx.translate(headCx, headCy);
        
        // Rotate to match direction
        if (this.dx === 1) ctx.rotate(0);
        else if (this.dx === -1) ctx.rotate(Math.PI);
        else if (this.dy === 1) ctx.rotate(Math.PI / 2);
        else if (this.dy === -1) ctx.rotate(-Math.PI / 2);
        
        // Draw Tongue (pointing right since rotation handles direction)
        if (flick) {
            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.moveTo(cs * 0.4, -2);
            ctx.lineTo(cs * 0.4 + tongueLength, -2);
            ctx.lineTo(cs * 0.4 + tongueLength + 3, -4); // fork
            ctx.lineTo(cs * 0.4 + tongueLength + 1, 0);
            ctx.lineTo(cs * 0.4 + tongueLength + 3, 4); // fork
            ctx.lineTo(cs * 0.4 + tongueLength, 2);
            ctx.lineTo(cs * 0.4, 2);
            ctx.fill();
        }

        // Draw Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cs * 0.1, -cs * 0.25, eyeSize * 1.3, 0, Math.PI * 2); // left eye
        ctx.arc(cs * 0.1, cs * 0.25, eyeSize * 1.3, 0, Math.PI * 2);  // right eye
        ctx.fill();
        
        // Draw Pupils (looking forward)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cs * 0.15, -cs * 0.25, eyeSize * 0.7, 0, Math.PI * 2); 
        ctx.arc(cs * 0.15, cs * 0.25, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _lerpColor(a, b, t) {
        const ah = parseInt(a.replace('#', ''), 16);
        const bh = parseInt(b.replace('#', ''), 16);
        const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
        const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
        const rr = Math.round(ar + (br - ar) * t);
        const rg = Math.round(ag + (bg - ag) * t);
        const rb = Math.round(ab + (bb - ab) * t);
        return `rgb(${rr},${rg},${rb})`;
    }
}
