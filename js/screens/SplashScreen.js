// ============================================
// SplashScreen — Animated entry screen
// ============================================

export class SplashScreen {
    constructor(element, screenManager, app) {
        this.element = element;
        this.sm = screenManager;
        this.app = app;
        
        this.element.innerHTML = `
            <div class="splash-bg-animation"></div>
            <div class="splash-container">
                <h1 class="logo-text">FruitVerse</h1>
                <h2 class="logo-subtext">SNAKE</h2>
                <div class="loading-bar"><div class="loading-progress"></div></div>
                <p class="tap-text" id="loadingText">Loading Profile...</p>
            </div>
        `;

        this.element.addEventListener('click', () => this.skip());
        this.element.addEventListener('touchstart', () => this.skip());
        
        this.skipped = false;
    }

    start() {
        this.skipped = false;
        const progress = this.element.querySelector('.loading-progress');
        const text = this.element.querySelector('#loadingText');
        progress.style.width = '0%';
        text.innerText = 'FruitVerse Engine Loading...';
        
        setTimeout(() => { if (!this.skipped) progress.style.width = '100%'; }, 100);
        
        // Auto-skip after 2 seconds
        this.timeout = setTimeout(() => {
            this.skip();
        }, 2000);
    }

    skip() {
        if (this.skipped) return;
        this.skipped = true;
        if (this.timeout) clearTimeout(this.timeout);
        
        this.sm.showScreen('login');
        // bgm started on login screen or menu, we can just let login be silent
    }
}
