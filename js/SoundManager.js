// ============================================
// SoundManager — Audio engine
// Equivalent to Java SoundManager class
// ============================================
export class SoundManager {
    constructor() {
        this.sounds = {};
        this.currentBgm = null;
        this.currentBgmKey = null;
        this.bgmVolume = 0.4;
        this.sfxVolume = 0.6;
        this.muted = false;
        this.audioUnlocked = false;

        this._preload();
        this._setupAutoUnlock();
    }

    _setupAutoUnlock() {
        const unlock = () => {
            if (this.audioUnlocked) return;
            this.audioUnlocked = true;
            
            Object.values(this.sounds).forEach(a => {
                a.load();
            });

            // Resume BGM if it was blocked
            if (this.currentBgm && this.currentBgm.paused && !this.muted) {
                this.currentBgm.play().catch(() => {});
            }

            document.removeEventListener('click', unlock, true);
            document.removeEventListener('touchstart', unlock, true);
            document.removeEventListener('keydown', unlock, true);
        };

        document.addEventListener('click', unlock, true);
        document.addEventListener('touchstart', unlock, true);
        document.addEventListener('keydown', unlock, true);
    }

    _preload() {
        const sfxFiles = {
            eat: 'assets/sounds/eat.wav',
            heal: 'assets/sounds/heal.wav',
            damage: 'assets/sounds/damage.wav',
            gameover: 'assets/sounds/gameover.wav',
            ability: 'assets/sounds/ability.wav',
        };
        const bgmFiles = {
            bgm_menu: 'assets/sounds/bgm_menu.wav',
            bgm_dark: 'assets/sounds/bgm_dark.wav',
            bgm_desert: 'assets/sounds/bgm_desert.wav',
            bgm_forest: 'assets/sounds/bgm_forest.wav',
            bgm_neon: 'assets/sounds/bgm_neon.wav',
            bgm_snow: 'assets/sounds/bgm_snow.wav',
        };

        for (const [key, path] of Object.entries(sfxFiles)) {
            this.sounds[key] = new Audio(path);
            this.sounds[key].volume = this.sfxVolume;
        }
        for (const [key, path] of Object.entries(bgmFiles)) {
            this.sounds[key] = new Audio(path);
            this.sounds[key].volume = this.bgmVolume;
            this.sounds[key].loop = true;
        }
    }

    unlockAudio() {
        // Handled globally now by _setupAutoUnlock
    }

    _playSfx(key) {
        if (this.muted) return;
        const s = this.sounds[key];
        if (!s) return;
        s.currentTime = 0;
        s.volume = this.sfxVolume;
        s.play().catch(() => {});
    }

    _playBgm(key) {
        if (this.currentBgmKey === key && this.currentBgm) {
            // Already playing this BGM, ensure it's unpaused but don't restart time
            if (this.currentBgm.paused && !this.muted) {
                this.currentBgm.play().catch(() => {});
            }
            return;
        }
        
        this.stopCurrentBgm();
        const s = this.sounds[key];
        if (!s) return;
        s.currentTime = 0;
        s.volume = this.bgmVolume;
        s.loop = true;
        this.currentBgm = s;
        this.currentBgmKey = key;
        if (!this.muted) {
            s.play().catch(() => {});
        }
    }

    // ---- Public BGM methods ----
    playMenuBgm()          { this._playBgm('bgm_menu'); }
    playGameBgm(mapType)   {
        const key = 'bgm_' + mapType.toLowerCase();
        this._playBgm(key);
    }
    stopCurrentBgm() {
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
            this.currentBgm = null;
            this.currentBgmKey = null;
        }
    }
    pauseBgm() {
        if (this.currentBgm) this.currentBgm.pause();
    }
    resumeBgm() {
        if (this.currentBgm && !this.muted) {
            this.currentBgm.play().catch(() => {});
        }
    }

    // ---- Public SFX methods ----
    playEatSound()       { this._playSfx('eat'); }
    playHealSound()      { this._playSfx('heal'); }
    playDamageSound()    { this._playSfx('damage'); }
    playAbilitySound()   { this._playSfx('ability'); }
    playGameOverSound()  { this._playSfx('gameover'); }
    
    stopGameOverSound() {
        const s = this.sounds['gameover'];
        if (s && !s.paused) {
            s.pause();
            s.currentTime = 0;
        }
    }

    // ---- Volume control ----
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.pauseBgm();
        } else {
            this.resumeBgm();
        }
        return this.muted;
    }

    setMuted(val) {
        this.muted = val;
        if (this.muted) this.pauseBgm();
        else this.resumeBgm();
    }
}
