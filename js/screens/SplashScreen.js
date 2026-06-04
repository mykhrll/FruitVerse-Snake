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

    async start() {
        this.skipped = false;
        const progress = this.element.querySelector('.loading-progress');
        const text = this.element.querySelector('#loadingText');
        progress.style.width = '0%';
        
        try {
            // Load cloud profile
            progress.style.width = '30%';
            const playerName = this.app.storage.getPlayerName();
            await this.app.storage.initCloudProfile(playerName);
            
            progress.style.width = '70%';
            await this.app.storage.fetchGlobalDailyQuests();
            
            progress.style.width = '100%';
            text.innerText = 'Tap anywhere to start';
            
            // Auto-skip after 2 seconds if loaded
            this.timeout = setTimeout(() => {
                this.skip();
            }, 2000);
        } catch (e) {
            console.error("Firebase load error", e);
            progress.style.width = '100%';
            text.innerText = 'Offline Mode - Tap anywhere';
            this.timeout = setTimeout(() => {
                this.skip();
            }, 3000);
        }
    }

    skip() {
        if (this.skipped) return;
        this.skipped = true;
        if (this.timeout) clearTimeout(this.timeout);
        
        this.sm.showScreen('menu');
        this.app.soundManager.playMenuBgm();
    }
}
