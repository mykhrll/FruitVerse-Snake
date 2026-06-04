// ============================================
// Item — Abstract base class for all items
// Equivalent to Java abstract Item class
// ============================================

export class Item {
    constructor(x, y, icon = '?') {
        if (new.target === Item) {
            throw new Error('Item is abstract and cannot be instantiated directly.');
        }
        this.x = x;
        this.y = y;
        this.icon = icon;
        this.alive = true;
        this.spawnTime = Date.now();
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    /**
     * Apply item effect to snake — must be overridden
     * @param {Snake} snake
     * @param {GameManager} gm
     */
    applyEffect(snake, gm) {
        throw new Error('applyEffect() must be implemented by subclass');
    }

    getColor() {
        return '#ffffff';
    }

    getIcon() {
        return this.icon;
    }

    draw(ctx, cellSize) {
        if (!this.alive) return;
        const px = this.x * cellSize;
        const py = this.y * cellSize;
        const pulse = 1 + 0.08 * Math.sin(Date.now() * 0.004 + this.pulsePhase);

        ctx.save();
        ctx.translate(px + cellSize / 2, py + cellSize / 2);
        ctx.scale(pulse, pulse);

        // Background glow
        ctx.fillStyle = this.getColor();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(0, 0, cellSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Custom drawing per item type
        this.drawContent(ctx, cellSize);

        ctx.restore();
    }

    drawContent(ctx, cellSize) {
        // To be overridden by subclasses
    }

    isAtPosition(x, y) {
        return this.x === x && this.y === y;
    }

    /**
     * Update item state per tick
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // Default does nothing
    }
}
