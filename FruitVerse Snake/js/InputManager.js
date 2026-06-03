// ============================================
// InputManager — Keyboard & Touch input handling
// ============================================
export class InputManager {
    constructor() {
        this.keys = {};
        this.direction = null;      // last direction pressed
        this.abilityPressed = null;  // 1-4
        this.pausePressed = false;
        this.swipeDir = null;

        this._touchStartX = 0;
        this._touchStartY = 0;
        this._swipeThreshold = 30;

        this._callbacks = {
            direction: [],
            ability: [],
            pause: [],
        };

        this._bindKeyboard();
        this._bindTouch();
    }

    _bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Direction
            let dir = null;
            if (e.code === 'ArrowUp'    || e.code === 'KeyW') dir = { dx: 0, dy: -1 };
            if (e.code === 'ArrowDown'  || e.code === 'KeyS') dir = { dx: 0, dy: 1 };
            if (e.code === 'ArrowLeft'  || e.code === 'KeyA') dir = { dx: -1, dy: 0 };
            if (e.code === 'ArrowRight' || e.code === 'KeyD') dir = { dx: 1, dy: 0 };
            if (dir) {
                e.preventDefault();
                this.direction = dir;
                this._callbacks.direction.forEach(cb => cb(dir));
            }

            // Abilities
            if (e.code === 'Digit1') { this.abilityPressed = 0; this._callbacks.ability.forEach(cb => cb(0)); }
            if (e.code === 'Digit2') { this.abilityPressed = 1; this._callbacks.ability.forEach(cb => cb(1)); }
            if (e.code === 'Digit3') { this.abilityPressed = 2; this._callbacks.ability.forEach(cb => cb(2)); }
            if (e.code === 'Digit4') { this.abilityPressed = 3; this._callbacks.ability.forEach(cb => cb(3)); }

            // Pause
            if (e.code === 'Space') {
                e.preventDefault();
                this.pausePressed = true;
                this._callbacks.pause.forEach(cb => cb());
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    _bindTouch() {
        document.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            this._touchStartX = t.clientX;
            this._touchStartY = t.clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            const dx = t.clientX - this._touchStartX;
            const dy = t.clientY - this._touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) < this._swipeThreshold) return;

            let dir = null;
            if (absDx > absDy) {
                dir = dx > 0 ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 };
            } else {
                dir = dy > 0 ? { dx: 0, dy: 1 } : { dx: 0, dy: -1 };
            }
            if (dir) {
                this.direction = dir;
                this.swipeDir = dir;
                this._callbacks.direction.forEach(cb => cb(dir));
            }
        }, { passive: true });
    }

    onDirection(cb)  { this._callbacks.direction.push(cb); }
    onAbility(cb)    { this._callbacks.ability.push(cb); }
    onPause(cb)      { this._callbacks.pause.push(cb); }

    consumeDirection() {
        const d = this.direction;
        this.direction = null;
        return d;
    }

    consumeAbility() {
        const a = this.abilityPressed;
        this.abilityPressed = null;
        return a;
    }

    consumePause() {
        const p = this.pausePressed;
        this.pausePressed = false;
        return p;
    }
}
