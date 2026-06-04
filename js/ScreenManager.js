// ============================================
// ScreenManager — Handles DOM screen transitions
// ============================================
export class ScreenManager {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
    }

    register(name, element) {
        this.screens[name] = element;
        element.classList.add('screen');
        element.classList.add('screen-hidden');
    }

    showScreen(name, animate = true) {
        const el = this.screens[name];
        if (!el) return;

        // Hide current
        if (this.currentScreen && this.screens[this.currentScreen]) {
            const cur = this.screens[this.currentScreen];
            cur.classList.add('screen-hidden');
            cur.classList.remove('screen-exit'); // just in case
        }

        // Show new
        el.classList.remove('screen-hidden');
        if (animate) {
            el.classList.add('screen-enter');
            setTimeout(() => {
                el.classList.remove('screen-enter');
            }, 300); // matches css animation time
        }

        this.currentScreen = name;
    }

    hideScreen(name) {
        const el = this.screens[name];
        if (el) el.classList.add('screen-hidden');
        if (this.currentScreen === name) this.currentScreen = null;
    }

    hideAll() {
        Object.values(this.screens).forEach(el => el.classList.add('screen-hidden'));
        this.currentScreen = null;
    }

    getCurrent() {
        return this.currentScreen;
    }
}
