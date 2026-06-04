// ============================================
// PortalFruit — Extends Item
// Special: spawns every 60s, lives 60s
// Eating it switches the map
// ============================================
import { Item } from './Item.js';

export class PortalFruit extends Item {
    constructor(x, y) {
        super(x, y, '🌀');
        this.lifetime = 60000; // 60 seconds
    }

    applyEffect(snake, gm) {
        gm.switchMap();
        gm.addScore(50);
        gm.addCoin(5);
        gm.soundManager.playEatSound();
        snake.grow();
        this.alive = false;
    }

    getColor() {
        return '#e040fb';
    }

    isExpired() {
        return Date.now() - this.spawnTime > this.lifetime;
    }

    update(deltaTime) {
        if (this.isExpired()) {
            this.alive = false;
        }
    }

    draw(ctx, cellSize) {
        if (!this.alive) return;
        const px = this.x * cellSize;
        const py = this.y * cellSize;
        const t = Date.now() * 0.003;
        const pulse = 1 + 0.15 * Math.sin(t + this.pulsePhase);
        const rotation = t * 0.5;

        // Remaining time indicator
        const elapsed = Date.now() - this.spawnTime;
        const remaining = Math.max(0, 1 - elapsed / this.lifetime);

        ctx.save();
        ctx.translate(px + cellSize / 2, py + cellSize / 2);
        ctx.scale(pulse, pulse);

        // Rainbow glow ring
        const gradient = ctx.createRadialGradient(0, 0, cellSize * 0.15, 0, 0, cellSize * 0.55);
        const hue = (Date.now() * 0.1) % 360;
        gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.4)`);
        gradient.addColorStop(0.5, `hsla(${(hue + 120) % 360}, 100%, 60%, 0.2)`);
        gradient.addColorStop(1, `hsla(${(hue + 240) % 360}, 100%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Timer ring
        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.7)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 0.45, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remaining);
        ctx.stroke();

        // Rotating swirl shape
        ctx.rotate(rotation);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 20; i++) {
            const angle = 0.5 * i;
            const r = 0.8 * angle;
            const px = r * Math.cos(angle);
            const py = r * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.restore();
    }
}
