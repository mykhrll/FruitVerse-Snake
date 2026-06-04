// ============================================
// Main Entry Point
// ============================================
import { App } from './App.js';
import { ShopScreen } from './screens/ShopScreen.js';
import { MissionsScreen } from './screens/MissionsScreen.js';
import { HowToPlayScreen } from './screens/HowToPlayScreen.js';

document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log("Service Worker Registered"))
            .catch(err => console.error("Service Worker Registration Failed", err));
    }
    
    // Prevent default context menu for games
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Prevent default scrolling on mobile when swiping the canvas, but allow it on scrollable elements
    document.addEventListener('touchmove', e => {
        // Find if the touch is inside a scrollable area
        const isScrollable = e.target.closest('.missions-content, .shop-content, .htp-scroll-area, .lb-table-container');
        if (!isScrollable && e.target.tagName !== 'INPUT') { 
            e.preventDefault();
        }
    }, { passive: false });

    // Initialize and start App
    const app = new App();
    app.start();
    
    // Export to window for debugging (optional)
    window.FruitVerseApp = app;
});
