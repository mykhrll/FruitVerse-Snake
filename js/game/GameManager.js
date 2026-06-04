// ============================================
// GameManager — Core game logic engine
// Equivalent to Java GameManager
// ============================================
import { Snake } from './Snake.js';
import { ItemFactory } from './items/ItemFactory.js';
import { AbilityManager, ABILITY_TYPES } from './AbilityManager.js';
import { getMapList, getNextMap, generateWalls } from './maps/MapType.js';

export class GameManager {
    constructor(cols, rows, soundManager) {
        this.cols = cols;
        this.rows = rows;
        this.soundManager = soundManager;
        this.itemFactory = new ItemFactory(cols, rows);
        this.abilityManager = new AbilityManager();

        this.snake = null;
        this.items = [];
        this.walls = [];
        this.score = 0;
        this.coins = 0;
        this.diamonds = 0;
        this.foodEaten = 0;
        this.abilitiesUsed = 0;
        this.gameOver = false;
        
        this.currentMap = getMapList()[0];
        
        // Timers
        this.baseTickInterval = 120; // ms
        this.lastTickTime = 0;
        this.lastPortalSpawnTime = Date.now();
        
        // Cache skin options
        this.skinDef = { colors: ['#4caf50', '#2e7d32'] }; // Default green
    }

    init(cols, rows, mapType, skinColor, skinShape) {
        this.cols = cols;
        this.rows = rows;
        this.currentMap = mapType;
        this.score = 0;
        this.coins = 0;
        this.diamonds = 0;
        this.gameOver = false;
        this.items = [];
        this.walls = generateWalls(this.cols, this.rows);
        this.abilityManager = new AbilityManager();
        
        // Define skin colors based on string
        this.skinDef = this._parseSkinColor(skinColor);
        
        const startX = Math.floor(this.cols / 2);
        const startY = Math.floor(this.rows / 2);
        this.snake = new Snake(startX, startY, this.skinDef.colors[0], skinShape);
        
        this.lastTickTime = Date.now();
        this.lastPortalSpawnTime = Date.now();
        
        // Initial spawn
        this.spawnItems();
        
        this.soundManager.playGameBgm(this.currentMap.name);
    }

    _parseSkinColor(skinStr) {
        switch (skinStr) {
            case 'ocean_blue': return { colors: ['#29b6f6', '#0277bd'] };
            case 'flame_red':  return { colors: ['#ef5350', '#c62828'] };
            case 'royal_purple': return { colors: ['#ab47bc', '#6a1b9a'] };
            case 'golden':     return { colors: ['#ffd54f', '#f57f17'] };
            case 'rainbow':    return { colors: ['rainbow'] };
            case 'classic_green':
            default:           return { colors: ['#4caf50', '#2e7d32'] };
        }
    }

    _checkAbilityInput(inputManager) {
        const ab = inputManager.consumeAbility();
        if (ab !== null) {
            this._tryUseAbility(ab + 1);
        }
    }

    _tryUseAbility(key) {
        const abilityDef = ABILITY_TYPES[key];
        if (!abilityDef) return;

        if (this.coins >= abilityDef.cost) {
            if (this.abilityManager.useAbility(key)) {
                this.coins -= abilityDef.cost;
                this.abilitiesUsed++;
                this.soundManager.playAbilitySound();
            }
        }
    }

    update(deltaTime, inputManager) {
        if (this.gameOver) return;

        this._checkAbilityInput(inputManager);

        const now = Date.now();
        this.abilityManager.tick(deltaTime);

        // Apply abilities modifiers
        this.snake.ghostMode = this.abilityManager.activeAbility === 'ghost';
        
        let currentInterval = this.baseTickInterval;
        if (this.abilityManager.activeAbility === 'slow') currentInterval = this.baseTickInterval * 1.5;
        if (this.abilityManager.activeAbility === 'speed') currentInterval = this.baseTickInterval * 0.6;
        
        // Magnet effect continuous
        if (this.abilityManager.activeAbility === 'magnet') {
            const head = this.snake.getHead();
            const magnetRadius = 4;
            this.items.forEach(it => {
                if (!it.alive) return;
                const dist = Math.abs(it.x - head.x) + Math.abs(it.y - head.y);
                if (dist <= magnetRadius) {
                    // Move item towards snake
                    if (now % 200 < 50) { // Throttle item movement
                        if (it.x < head.x) it.x++;
                        else if (it.x > head.x) it.x--;
                        else if (it.y < head.y) it.y++;
                        else if (it.y > head.y) it.y--;
                        
                        if (it.x === head.x && it.y === head.y) {
                            it.applyEffect(this.snake, this);
                        }
                    }
                }
            });
        }

        // Logic tick
        if (now - this.lastTickTime >= currentInterval) {
            this.lastTickTime = now;
            this._tick(inputManager);
        }
    }

    _tick(inputManager) {
        // Change direction
        const dir = inputManager.consumeDirection();
        if (dir) {
            this.snake.setDirection(dir.dx, dir.dy);
        }

        // Move snake
        this.snake.move();

        const head = this.snake.getHead();
        const isGhost = this.abilityManager.activeAbility === 'ghost';

        // Check Wall Bounds / Wrapping
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            if (isGhost) {
                // Wrap around
                if (head.x < 0) head.x = this.cols - 1;
                else if (head.x >= this.cols) head.x = 0;
                
                if (head.y < 0) head.y = this.rows - 1;
                else if (head.y >= this.rows) head.y = 0;
            } else {
                // Hit boundary without ghost - take continuous damage, stay stuck at edge
                this.snake.takeDamage(5);
                this.soundManager.playDamageSound();
                
                if (head.x < 0) head.x = 0;
                else if (head.x >= this.cols) head.x = this.cols - 1;
                
                if (head.y < 0) head.y = 0;
                else if (head.y >= this.rows) head.y = this.rows - 1;
            }
        }

        this.checkCollisions();
        
        // Clean dead items
        this.items = this.items.filter(it => it.alive);
        
        // Check portal fruit spawn (every 60s)
        const now = Date.now();
        if (now - this.lastPortalSpawnTime > 60000) {
            this.items.push(this.itemFactory.createPortalFruit(this.snake, this.items, this.walls));
            this.lastPortalSpawnTime = now;
        }

        // Clean expired portal fruits
        this.items.forEach(it => {
            if (it.constructor.name === 'PortalFruit' && it.isExpired()) {
                it.alive = false;
            }
        });

        this.spawnItems();
        
        if (!this.snake.alive) {
            this._setGameOver();
        }
    }

    checkCollisions() {
        const head = this.snake.getHead();

        // 1. Check self collision
        if (!this.snake.ghostMode && this.snake.checkSelfCollision()) {
            this.snake.takeDamage(20);
            this.soundManager.playDamageSound();
        }

        // 2. Check walls
        if (!this.snake.ghostMode) {
            const hitWall = this.walls.some(([wx, wy]) => wx === head.x && wy === head.y);
            if (hitWall) {
                this.snake.takeDamage(10);
                this.soundManager.playDamageSound();
                // Push snake back a bit visually if needed, but Java version just applies dmg
            }
        }

        // 3. Check items
        this.items.forEach(item => {
            if (item.alive && item.x === head.x && item.y === head.y) {
                item.applyEffect(this.snake, this);
                if (item.constructor.name === 'Food') {
                    this.foodEaten++;
                }
            }
        });
    }

    spawnItems() {
        let foodCount = 0;
        let potionCount = 0;
        let poisonCount = 0;
        let diamondCount = 0;

        this.items.forEach(it => {
            if (!it.alive) return;
            const name = it.constructor.name;
            if (name === 'Food') foodCount++;
            if (name === 'Potion') potionCount++;
            if (name === 'Poison') poisonCount++;
            if (name === 'DiamondFruit') diamondCount++;
        });

        while (foodCount < 10) {
            this.items.push(this.itemFactory.createFood(this.currentMap, this.snake, this.items, this.walls));
            foodCount++;
        }
        if (potionCount < 1) {
            this.items.push(this.itemFactory.createPotion(this.currentMap, this.snake, this.items, this.walls));
        }
        if (poisonCount < 1) {
            this.items.push(this.itemFactory.createPoison(this.currentMap, this.snake, this.items, this.walls));
        }
        
        // Very rare diamond spawn (only 1 active at a time, 2% chance per check if missing)
        if (diamondCount < 1 && Math.random() < 0.02) {
            this.items.push(this.itemFactory.createDiamondFruit(this.snake, this.items, this.walls));
        }
    }

    switchMap() {
        this.currentMap = getNextMap(this.currentMap.name);
        this.soundManager.playGameBgm(this.currentMap.name);
        // Clear items and respawn for new map
        this.items = [];
        this.spawnItems();
    }

    addScore(val) {
        this.score += val;
    }

    addCoin(val) {
        this.coins += val;
    }

    addDiamond(val) {
        this.diamonds += val;
    }

    _setGameOver() {
        this.gameOver = true;
        this.soundManager.stopCurrentBgm();
        this.soundManager.playGameOverSound();
    }
}
