// ============================================
// DiamondFruit — Extends Item
// Rare item that gives 1 diamond
// ============================================
import { Item } from './Item.js';

export class DiamondFruit extends Item {
    constructor(x, y) {
        super(x, y, '💎');
    }

    applyEffect(snake, gm) {
        gm.addScore(100);
        gm.addDiamond(1);
        gm.soundManager.playEatSound();
        this.alive = false;
    }

    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        
        // Draw a diamond shape
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.8, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.8, 0);
        ctx.closePath();
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.lineTo(s * 0.4, 0);
        ctx.lineTo(0, s * 0.5);
        ctx.lineTo(-s * 0.4, 0);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
