// ============================================
// MenuScreen — Main Menu
// ============================================

export class MenuScreen {
    constructor(element, app) {
        this.element = element;
        this.app = app;
        
        this.element.innerHTML = `
            <div class="menu-background">
                <div class="menu-particles" id="menuParticles"></div>
            </div>
            
            <div class="menu-container">
                <div class="profile-section">
                    <div class="css-snake-icon">
                        <div class="css-snake-head">
                            <div class="css-snake-eye left"></div>
                            <div class="css-snake-eye right"></div>
                            <div class="css-snake-tongue"></div>
                        </div>
                    </div>
                    <div id="displayPlayerName" style="color: white; font-size: 1.2em; font-weight: bold; margin-top: 5px;">Player</div>
                </div>
                
                <div class="logo-area">
                    <h1 class="logo-text">FruitVerse</h1>
                    <h2 class="logo-subtext">SNAKE</h2>
                </div>

                <div class="menu-buttons">
                    <button class="btn btn-primary" id="btnPlay">▶ PLAY</button>
                    <button class="btn btn-secondary" id="btnShop">🛒 SHOP</button>
                    <button class="btn btn-secondary" id="btnMissions">🎯 MISI & PENCAPAIAN</button>
                    <button class="btn btn-secondary" id="btnHowToPlay">📖 HOW TO PLAY</button>
                    <button class="btn btn-secondary" id="btnLeaderboard">🏆 LEADERBOARD</button>
                    <button class="btn btn-danger" id="btnExit">✖ EXIT</button>
                </div>
            </div>
        `;

        this.displayName = this.element.querySelector('#displayPlayerName');
        this._initParticles();
        
        // Bind buttons
        this.element.querySelector('#btnPlay').addEventListener('click', () => {
            this.app.soundManager.unlockAudio();
            this.app.screenManager.showScreen('game');
            this.app.screens.game.startGame();
        });
        
        this.element.querySelector('#btnShop').addEventListener('click', () => {
            this.app.soundManager.unlockAudio();
            this.app.screenManager.showScreen('shop');
            this.app.screens.shop.updateUI();
        });

        this.element.querySelector('#btnMissions').addEventListener('click', () => {
            this.app.soundManager.unlockAudio();
            this.app.screenManager.showScreen('missions');
            this.app.screens.missions.updateUI();
        });

        this.element.querySelector('#btnHowToPlay').addEventListener('click', () => {
            this.app.soundManager.unlockAudio();
            this.app.screenManager.showScreen('howToPlay');
        });

        this.element.querySelector('#btnLeaderboard').addEventListener('click', () => {
            this.app.soundManager.unlockAudio();
            this.app.screenManager.showScreen('leaderboard');
            this.app.screens.leaderboard.updateUI();
        });

        this.element.querySelector('#btnExit').addEventListener('click', () => {
            if (confirm("Are you sure you want to exit?")) {
                window.close();
            }
        });

        // Name input logic moved to LoginScreen
    }

    _initParticles() {
        const pContainer = this.element.querySelector('#menuParticles');
        let html = '';
        // Create 20 floating particles
        for(let i=0; i<20; i++) {
            const left = Math.random() * 100;
            const animDur = 10 + Math.random() * 20;
            const animDelay = Math.random() * 10;
            const size = 10 + Math.random() * 20;
            html += `<div class="menu-particle" style="left: ${left}%; width: ${size}px; height: ${size}px; animation-duration: ${animDur}s; animation-delay: -${animDelay}s;"></div>`;
        }
        pContainer.innerHTML = html;
    }

    onEnter() {
        this.displayName.innerText = this.app.storage.getPlayerName();
        this.app.soundManager.playMenuBgm();
    }
}
