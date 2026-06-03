// ============================================
// Main Entry Point
// ============================================
import { App } from './App.js';
import { ShopScreen } from './screens/ShopScreen.js';
import { MissionsScreen } from './screens/MissionsScreen.js';
import { HowToPlayScreen } from './screens/HowToPlayScreen.js';

document.addEventListener('DOMContentLoaded', () => {
    // Prevent default context menu for games
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Prevent default scrolling on mobile when swiping
    document.addEventListener('touchmove', e => {
        if (e.target.tagName !== 'INPUT') { // allow scroll if needed, but mostly prevent
            e.preventDefault();
        }
    }, { passive: false });

    // Initialize and start App
    const app = new App();
    app.start();
    
    // Export to window for debugging (optional)
    window.FruitVerseApp = app;
});
