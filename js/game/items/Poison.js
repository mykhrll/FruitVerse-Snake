// ============================================
// Poison — Extends Item
// Damages snake -10 HP
// ============================================
import { Item } from './Item.js';

export class Poison extends Item {
    constructor(x, y, mapType) {
        super(x, y, '☠️');
        this.damage = 10;
        this.baseColor = mapType ? mapType.wallGlow : '#ab47bc';
    }

    applyEffect(snake, gm) {
        snake.takeDamage(this.damage);
        gm.soundManager.playDamageSound();
        this.alive = false;
    }

    getColor() {
        return this.baseColor;
    }

    draw(ctx, cellSize) {
        if (!this.alive) return;
        const px = this.x * cellSize;
        const py = this.y * cellSize;
        const pulse = 1 + 0.12 * Math.sin(Date.now() * 0.006 + this.pulsePhase);

        ctx.save();
        ctx.translate(px + cellSize / 2, py + cellSize / 2);
        ctx.scale(pulse, pulse);

        // Purple glow
        ctx.shadowColor = this.baseColor;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // Draw Skull/Crossbones shape for Poison
        ctx.fillStyle = this.baseColor;
        const s = cellSize * 0.35;
        ctx.beginPath();
        ctx.arc(0, -s*0.2, s, Math.PI, 0);
        ctx.lineTo(s*0.6, s*0.8);
        ctx.lineTo(-s*0.6, s*0.8);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-s*0.4, 0, s*0.25, 0, Math.PI*2);
        ctx.arc(s*0.4, 0, s*0.25, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }
}
