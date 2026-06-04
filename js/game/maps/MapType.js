// ============================================
// MapType — Enum-like map definitions
// Matches Java MapType: DARK, FOREST, DESERT, SNOW, NEON
// ============================================

export const MAP_TYPES = {
    FOREST: {
        name: 'FOREST',
        displayName: '🌲 Forest',
        bgColor: '#1a2e1a',
        gridColor: 'rgba(34,85,34,0.25)',
        wallColor: '#5a3a1a',
        wallGlow: '#8b6914',
        accentColor: '#4caf50',
        bgmKey: 'forest',
        foodTypes: [
            { name: 'Apple',    emoji: '🍎', points: 10, coins: 1, color: '#e53935' },
            { name: 'Berry',    emoji: '🫐', points: 15, coins: 3, color: '#5c6bc0' },
            { name: 'Mushroom', emoji: '🍄', points: 20, coins: 10, color: '#ff7043' },
        ],
        particleColor: '#4caf50',
        particleType: 'leaves',
    },
    DESERT: {
        name: 'DESERT',
        displayName: '🏜️ Desert',
        bgColor: '#2e2212',
        gridColor: 'rgba(150,120,60,0.2)',
        wallColor: '#8d6e3a',
        wallGlow: '#c4a35a',
        accentColor: '#ff9800',
        bgmKey: 'desert',
        foodTypes: [
            { name: 'Cactus Fruit', emoji: '🌵', points: 10, coins: 1, color: '#66bb6a' },
            { name: 'Date',         emoji: '🌴', points: 15, coins: 3, color: '#8d6e63' },
            { name: 'Melon',        emoji: '🍈', points: 20, coins: 10, color: '#aed581' },
        ],
        particleColor: '#c4a35a',
        particleType: 'sand',
    },
    SNOW: {
        name: 'SNOW',
        displayName: '❄️ Snow',
        bgColor: '#1a2233',
        gridColor: 'rgba(150,200,255,0.15)',
        wallColor: '#5a7a9a',
        wallGlow: '#90caf9',
        accentColor: '#42a5f5',
        bgmKey: 'snow',
        foodTypes: [
            { name: 'Frozen Berry', emoji: '🧊', points: 10, coins: 1, color: '#64b5f6' },
            { name: 'Candy Cane',   emoji: '🍬', points: 15, coins: 3, color: '#ef5350' },
            { name: 'Hot Cocoa',    emoji: '☕', points: 20, coins: 10, color: '#8d6e63' },
        ],
        particleColor: '#e3f2fd',
        particleType: 'snow',
    },
    NEON: {
        name: 'NEON',
        displayName: '🌃 Neon',
        bgColor: '#0a0a1a',
        gridColor: 'rgba(0,255,255,0.08)',
        wallColor: '#ff00ff',
        wallGlow: '#00ffff',
        accentColor: '#e040fb',
        bgmKey: 'neon',
        foodTypes: [
            { name: 'Pixel Candy',  emoji: '🍭', points: 10, coins: 1, color: '#e040fb' },
            { name: 'Energy Orb',   emoji: '⚡', points: 15, coins: 3, color: '#ffeb3b' },
            { name: 'Neon Fruit',   emoji: '🔮', points: 20, coins: 10, color: '#00e5ff' },
        ],
        particleColor: '#e040fb',
        particleType: 'neon',
    },
    DARK: {
        name: 'DARK',
        displayName: '🌑 Dark',
        bgColor: '#0d0d0d',
        gridColor: 'rgba(100,50,100,0.15)',
        wallColor: '#3a1a3a',
        wallGlow: '#8e24aa',
        accentColor: '#ab47bc',
        bgmKey: 'dark',
        foodTypes: [
            { name: 'Shadow Fruit', emoji: '🖤', points: 10, coins: 1, color: '#7e57c2' },
            { name: 'Ghost Apple',  emoji: '👻', points: 15, coins: 3, color: '#bdbdbd' },
            { name: 'Moon Berry',   emoji: '🌙', points: 20, coins: 10, color: '#fdd835' },
        ],
        particleColor: '#7e57c2',
        particleType: 'dark',
    },
};

// Helper to get map list as array
export function getMapList() {
    return Object.values(MAP_TYPES);
}

// Get next map in cycle
export function getNextMap(currentMapName) {
    const names = Object.keys(MAP_TYPES);
    const idx = names.indexOf(currentMapName);
    const nextIdx = (idx + 1) % names.length;
    return MAP_TYPES[names[nextIdx]];
}

// Default wall layout generator
export function generateWalls(cols, rows) {
    // Borders removed by user request
    const walls = [];
    return walls;
}
