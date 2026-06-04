// ============================================
// LoginScreen — Prompt user for Name
// ============================================

export class LoginScreen {
    constructor(element, app) {
        this.element = element;
        this.app = app;
        
        this.element.innerHTML = `
            <div class="login-container glass-panel">
                <h1 class="logo-text" style="font-size: 3em;">Welcome</h1>
                <p style="color: #aaa; margin-bottom: 20px;">Masukkan nama pemain untuk melanjutkan</p>
                
                <input type="text" id="loginNameInput" class="player-name-input" maxlength="15" placeholder="Nama Pemain">
                
                <div id="loginStatus" style="color: #ffeb3b; margin-top: 15px; font-size: 0.9em; height: 20px;"></div>
                
                <button class="btn btn-primary" id="btnLogin" style="margin-top: 20px; width: 100%;">Masuk / Mulai</button>
            </div>
        `;

        this.input = this.element.querySelector('#loginNameInput');
        this.btn = this.element.querySelector('#btnLogin');
        this.status = this.element.querySelector('#loginStatus');

        this.btn.addEventListener('click', () => this.handleLogin());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    onEnter() {
        // Pre-fill if name already exists in local storage
        const savedName = this.app.storage.load('playerName', '');
        if (savedName && savedName !== 'Player') {
            this.input.value = savedName;
        } else {
            this.input.value = '';
        }
        this.status.innerText = '';
        this.btn.disabled = false;
        this.input.focus();
    }

    async handleLogin() {
        const name = this.input.value.trim();
        if (!name) {
            this.status.innerText = 'Nama tidak boleh kosong!';
            this.status.style.color = '#f44336';
            return;
        }

        this.btn.disabled = true;
        this.input.disabled = true;
        this.status.style.color = '#ffeb3b';
        this.status.innerText = 'Memuat Data Profil...';

        try {
            // Save locally and fetch cloud profile
            await this.app.storage.setPlayerName(name);
            await this.app.storage.fetchGlobalDailyQuests();
            
            this.status.innerText = 'Berhasil!';
            this.status.style.color = '#4caf50';
            
            // Allow a small visual delay for feedback
            setTimeout(() => {
                this.app.screenManager.showScreen('menu');
                this.app.soundManager.playMenuBgm();
            }, 500);

        } catch (e) {
            console.error("Firebase Login Error", e);
            this.status.innerText = 'Gagal terhubung (Offline Mode)';
            this.status.style.color = '#f44336';
            
            setTimeout(() => {
                this.app.screenManager.showScreen('menu');
                this.app.soundManager.playMenuBgm();
            }, 1000);
        } finally {
            this.btn.disabled = false;
            this.input.disabled = false;
        }
    }
}
