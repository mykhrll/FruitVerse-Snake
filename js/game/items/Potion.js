// ============================================
// Potion — Extends Item
// Heals snake +10 HP
// ============================================
import { Item } from './Item.js';

export class Potion extends Item {
    constructor(x, y, mapType) {
        super(x, y, '💚');
        this.healAmount = 10;
        this.baseColor = mapType ? mapType.particleColor : '#4caf50';
    }

    applyEffect(snake, gm) {
        snake.heal(this.healAmount);
        gm.soundManager.playHealSound();
        this.alive = false;
    }

    getColor() {
        return this.baseColor;
    }

    draw(ctx, cellSize) {
        if (!this.alive) return;
        const px = this.x * cellSize;
        const py = this.y * cellSize;
        const pulse = 1 + 0.1 * Math.sin(Date.now() * 0.005 + this.pulsePhase);

        ctx.save();
        ctx.translate(px + cellSize / 2, py + cellSize / 2);
        ctx.scale(pulse, pulse);

        // Green glow
        ctx.shadowColor = this.baseColor;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = this.baseColor;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // Draw Heart Shape for Potion
        ctx.fillStyle = this.baseColor;
        const w = cellSize * 0.45;
        const h = cellSize * 0.45;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.3);
        ctx.bezierCurveTo(0, -h * 0.1, -w, -h * 0.1, -w, h * 0.3);
        ctx.bezierCurveTo(-w, h * 0.8, 0, h * 1.2, 0, h * 1.2);
        ctx.bezierCurveTo(0, h * 1.2, w, h * 0.8, w, h * 0.3);
        ctx.bezierCurveTo(w, -h * 0.1, 0, -h * 0.1, 0, h * 0.3);
        ctx.fill();

        ctx.restore();
    }
}
