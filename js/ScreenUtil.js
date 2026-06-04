// ============================================
// ScreenUtil — Responsive screen sizing utility
// Equivalent to Java ScreenUtil class
// ============================================
export class ScreenUtil {
    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        window.addEventListener('resize', () => this.update());
    }

    update() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    getWidth() { return this.width; }
    getHeight() { return this.height; }

    isMobile() {
        return this.width <= 768 || ('ontouchstart' in window);
    }

    getGameAreaSize() {
        const maxW = Math.min(this.width, 900);
        const maxH = Math.min(this.height, 700);
        return { width: maxW, height: maxH };
    }

    getCellSize(cols = 30, rows = 20) {
        const area = this.getGameAreaSize();
        return Math.floor(Math.min(area.width / cols, area.height / rows));
    }
}
