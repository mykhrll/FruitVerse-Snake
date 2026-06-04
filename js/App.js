// ============================================
// App — Master controller (Equivalent to Stage)
// ============================================
import { ScreenUtil } from './ScreenUtil.js';
import { LocalStorageService } from './services/LocalStorageService.js';
import { CloudSyncService } from './services/CloudSyncService.js';
import { LeaderboardManager } from './LeaderboardManager.js';
import { SoundManager } from './SoundManager.js';
import { InputManager } from './InputManager.js';
import { ScreenManager } from './ScreenManager.js';

// Screens
import { SplashScreen } from './screens/SplashScreen.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { MenuScreen } from './screens/MenuScreen.js';
import { GameScreen } from './screens/GameScreen.js';
import { ShopScreen } from './screens/ShopScreen.js';
import { HowToPlayScreen } from './screens/HowToPlayScreen.js';
import { LeaderboardScreen } from './screens/LeaderboardScreen.js';
import { MissionsScreen } from './screens/MissionsScreen.js';

export class App {
    constructor() {
        // Utilities & Core
        this.screenUtil = new ScreenUtil();
        this.localService = new LocalStorageService();
        this.cloudService = new CloudSyncService(this.localService);
        this.leaderboard = new LeaderboardManager(this.localService);
        this.soundManager = new SoundManager();
        this.inputManager = new InputManager();
        this.screenManager = new ScreenManager();
        
        // Initialize Screens
        this.screens = {};
        
        const registerScreen = (name, ClassRef) => {
            const el = document.getElementById(`screen-${name}`);
            this.screenManager.register(name, el);
            let instance;
            if (name === 'splash') {
                instance = new ClassRef(el, this.screenManager, this);
            } else {
                instance = new ClassRef(el, this);
            }
            this.screens[name] = instance;
        };

        registerScreen('splash', SplashScreen);
        registerScreen('login', LoginScreen);
        registerScreen('menu', MenuScreen);
        registerScreen('game', GameScreen);
        registerScreen('shop', ShopScreen);
        registerScreen('howToPlay', HowToPlayScreen);
        registerScreen('leaderboard', LeaderboardScreen);
        registerScreen('missions', MissionsScreen);
        
        // Hook into ScreenManager changes to trigger lifecycle events
        const origShow = this.screenManager.showScreen.bind(this.screenManager);
        this.screenManager.showScreen = (name, animate) => {
            origShow(name, animate);
            if (this.screens[name] && typeof this.screens[name].onEnter === 'function') {
                this.screens[name].onEnter();
            }
        };
    }

    start() {
        this.screenManager.showScreen('splash', false);
        this.screens['splash'].start();
    }
}
