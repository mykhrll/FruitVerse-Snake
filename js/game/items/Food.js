// ============================================
// Food — Extends Item
// Adds score + coins, grows snake
// ============================================
import { Item } from './Item.js';

export class Food extends Item {
    constructor(x, y, foodDef) {
        super(x, y, foodDef.emoji);
        this.points = foodDef.points;
        this.coins = foodDef.coins || 1;
        this.foodType = foodDef.name;
        this.color = foodDef.color;
        this.isFood = true;
    }

    applyEffect(snake, gm) {
        gm.addScore(this.points);
        gm.addCoin(this.coins);
        snake.grow();
        gm.soundManager.playEatSound();
        this.alive = false;
    }

    getColor() {
        return this.color;
    }

    // Abstract method to be overridden by subclasses
    drawContent(ctx, cellSize) {
        throw new Error('drawContent() must be implemented by subclass');
    }
}

// ---------------------------------------------------------
// Subclasses implementing specific drawing logic (OCP)
// ---------------------------------------------------------

export class AppleFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Apple shape
        ctx.beginPath();
        ctx.arc(-s*0.3, 0, s*0.7, 0, Math.PI*2);
        ctx.arc(s*0.3, 0, s*0.7, 0, Math.PI*2);
        ctx.fill();
        // Stem
        ctx.strokeStyle = '#558b2f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -s*0.5);
        ctx.quadraticCurveTo(s*0.5, -s, s*0.8, -s*1.2);
        ctx.stroke();
    }
}

export class BerryFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Cluster of berries
        ctx.beginPath();
        ctx.arc(-s*0.4, -s*0.2, s*0.5, 0, Math.PI*2);
        ctx.arc(s*0.4, -s*0.2, s*0.5, 0, Math.PI*2);
        ctx.arc(0, s*0.4, s*0.5, 0, Math.PI*2);
        ctx.fill();
    }
}

export class MushroomFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Mushroom Cap
        ctx.beginPath();
        ctx.arc(0, 0, s, Math.PI, 0);
        ctx.fill();
        // Stem
        ctx.fillStyle = '#fff';
        ctx.fillRect(-s*0.3, 0, s*0.6, s*0.7);
    }
}

export class CactusFruitFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Oval with spikes
        ctx.beginPath();
        ctx.ellipse(0, 0, s*0.8, s*1.1, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        for (let i=0; i<4; i++) {
            ctx.fillRect((Math.random()-0.5)*s, (Math.random()-0.5)*s, 2, 2);
        }
    }
}

export class DateFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Long brown oval
        ctx.beginPath();
        ctx.ellipse(0, 0, s*0.6, s*1.2, Math.PI/4, 0, Math.PI*2);
        ctx.fill();
    }
}

export class MelonFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Semi-circle slice
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI, false);
        ctx.fill();
        ctx.fillStyle = '#ff5252'; // inner red
        ctx.beginPath();
        ctx.arc(0, 0, s*0.7, 0, Math.PI, false);
        ctx.fill();
    }
}

export class CandyCaneFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        // Candy cane shape
        ctx.strokeStyle = this.color;
        ctx.lineWidth = s*0.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-s*0.5, s);
        ctx.lineTo(-s*0.5, -s*0.2);
        ctx.arc(0, -s*0.2, s*0.5, Math.PI, 0);
        ctx.lineTo(s*0.5, 0);
        ctx.stroke();
        // White stripes
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-s*0.7, s*0.5); ctx.lineTo(-s*0.3, s*0.3);
        ctx.moveTo(-s*0.7, 0); ctx.lineTo(-s*0.3, -s*0.2);
        ctx.stroke();
    }
}

export class CocoaFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        // Mug
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(-s*0.6, -s*0.5, s*1.2, s*1.2); // cup
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s*0.6, 0, s*0.4, -Math.PI/2, Math.PI/2);
        ctx.stroke(); // handle
        ctx.fillStyle = this.color; // brown liquid
        ctx.fillRect(-s*0.5, -s*0.4, s*1, s*0.2);
    }
}

export class PixelCandyFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Candy wrapped
        ctx.fillRect(-s*0.6, -s*0.6, s*1.2, s*1.2);
        ctx.beginPath();
        ctx.moveTo(-s*0.6, 0);
        ctx.lineTo(-s*1.2, -s*0.5);
        ctx.lineTo(-s*1.2, s*0.5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(s*0.6, 0);
        ctx.lineTo(s*1.2, -s*0.5);
        ctx.lineTo(s*1.2, s*0.5);
        ctx.fill();
    }
}

export class OrbFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Glowing orb
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-s*0.3, -s*0.3, s*0.3, 0, Math.PI*2);
        ctx.fill();
    }
}

export class FallbackFood extends Food {
    drawContent(ctx, cellSize) {
        const s = cellSize * 0.4;
        ctx.fillStyle = this.color;
        // Fallback polygon
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
        }
        ctx.closePath();
        ctx.fill();
    }
}
