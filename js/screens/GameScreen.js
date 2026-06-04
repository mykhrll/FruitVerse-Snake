// ============================================
// GameScreen — Main gameplay UI & canvas
// Equivalent to Java GamePane
// ============================================
import { GameManager } from '../game/GameManager.js';
import { MapRenderer } from '../game/maps/MapRenderer.js';
import { ABILITY_TYPES } from '../game/AbilityManager.js';
import { getMapList } from '../game/maps/MapType.js';

export class GameScreen {
    constructor(element, app) {
        this.element = element;
        this.app = app;
        this.cols = 40;
        this.rows = 25;
        
        this.element.innerHTML = `
            <div class="game-container">
                <div class="canvas-wrapper">
                    <canvas id="gameCanvas"></canvas>
                    <div id="pauseOverlay" class="game-overlay glass-panel hidden">
                        <h2>PAUSED</h2>
                        <button class="btn btn-primary" id="btnResume">Resume (Space)</button>
                        <button class="btn btn-danger" id="btnQuitToMenu">Quit to Menu</button>
                    </div>
                    <div id="gameOverOverlay" class="game-overlay glass-panel hidden">
                        <h2>GAME OVER</h2>
                        <p>Score: <span id="goScore">0</span></p>
                        <button class="btn btn-primary" id="btnPlayAgain">Play Again</button>
                        <button class="btn btn-secondary" id="btnSubmitScore">Quit to Menu</button>
                    </div>
                </div>
                
                <div class="hud-panel glass-panel">
                    <div class="hud-top">
                        <div class="hud-stat"><span class="icon">🏆</span> <span id="hudScore">0</span></div>
                        <div class="hud-stat"><span class="icon">🪙</span> <span id="hudCoins">0</span></div>
                        <button class="btn-icon" id="btnPause" title="Pause (Space)">⏸️</button>
                    </div>
                    
                    <div class="hud-map-info">
                        Map: <span id="hudMapName">Forest</span>
                    </div>

                    <div class="hud-health">
                        <div class="hp-bar-bg"><div class="hp-bar-fill" id="hudHpBar"></div></div>
                        <div class="hp-text"><span id="hudHp">100</span>/100</div>
                    </div>
                    
                    <div class="hud-abilities">
                        <h3>Abilities (1-4)</h3>
                        <div class="ability-grid" id="abilityGrid"></div>
                    </div>

                    <div class="hud-guide-panel">
                        <h3>ℹ️ Info Bermain</h3>
                        <div class="hud-guide-content">
                            <p><strong>Arah:</strong> W,A,S,D / Layar Sentuh</p>
                            <p><strong>Kekuatan:</strong> Tombol 1,2,3,4</p>
                            <hr>
                            <div id="hudFoodGuide"></div>
                        </div>
                    </div>
                </div>

                <!-- Mobile Controls Overlay -->
                <div class="mobile-controls hidden" id="mobileControls">
                    <div class="d-pad">
                        <button class="d-btn up" data-dir="up">▲</button>
                        <button class="d-btn left" data-dir="left">◀</button>
                        <button class="d-btn right" data-dir="right">▶</button>
                        <button class="d-btn down" data-dir="down">▼</button>
                    </div>
                    <div class="mobile-abilities" id="mobileAbilities"></div>
                </div>
            </div>
        `;

        this.canvas = this.element.querySelector('#gameCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.pauseOverlay = this.element.querySelector('#pauseOverlay');
        this.gameOverOverlay = this.element.querySelector('#gameOverOverlay');
        this.mobileControls = this.element.querySelector('#mobileControls');
        
        // HUD Elements
        this.hudScore = this.element.querySelector('#hudScore');
        this.hudCoins = this.element.querySelector('#hudCoins');
        this.hudMapName = this.element.querySelector('#hudMapName');
        this.hudHp = this.element.querySelector('#hudHp');
        this.hudHpBar = this.element.querySelector('#hudHpBar');
        this.abilityGrid = this.element.querySelector('#abilityGrid');
        
        this.gameManager = new GameManager(this.cols, this.rows, this.app.soundManager);
        this.mapRenderer = new MapRenderer(this.cols, this.rows);
        
        this.paused = false;
        this.animationFrameId = null;
        this.lastRenderTime = 0;
        
        this._initUI();
        this._bindEvents();
    }

    _initUI() {
        // Build ability UI
        const abilityDefs = Object.values(ABILITY_TYPES);
        this.abilityGrid.innerHTML = abilityDefs.map((a, idx) => `
            <div class="ability-slot" id="ab-slot-${a.id}">
                <div class="ab-icon">${this._getAbilityEmoji(a.id)}</div>
                <div class="ab-name">${a.name}</div>
                <div class="ab-cost">${a.cost} 🪙</div>
                <div class="ab-active-bar" id="ab-act-${a.id}"></div>
                <div class="ab-key">${idx + 1}</div>
            </div>
        `).join('');

        // Build mobile abilities
        const mobAb = this.element.querySelector('#mobileAbilities');
        mobAb.innerHTML = Object.keys(ABILITY_TYPES).map((key, idx) => {
            const a = ABILITY_TYPES[key];
            return `<button class="m-ab-btn" data-id="${key}">
                        ${this._getAbilityEmoji(a.id)}
                        <span class="m-ab-key">${idx + 1}</span>
                    </button>`;
        }).join('');
    }

    _getAbilityEmoji(id) {
        if (id === 'slow') return '⏱️';
        if (id === 'speed') return '⚡';
        if (id === 'magnet') return '🧲';
        if (id === 'ghost') return '👻';
        return '❓';
    }

    _bindEvents() {
        // Buttons
        this.element.querySelector('#btnPause').addEventListener('click', () => this.togglePause());
        this.element.querySelector('#btnResume').addEventListener('click', () => this.togglePause());
        this.element.querySelector('#btnQuitToMenu').addEventListener('click', () => {
            this.app.soundManager.stopGameOverSound();
            this.backToMenu();
        });
        this.element.querySelector('#btnPlayAgain').addEventListener('click', () => {
            this.app.soundManager.stopGameOverSound();
            this.startGame();
        });
        this.element.querySelector('#btnSubmitScore').addEventListener('click', () => {
            this.app.soundManager.stopGameOverSound();
            this.app.leaderboard.addEntry(this.app.storage.getPlayerName(), this.gameManager.score, this.gameManager.currentMap.displayName);
            this.app.storage.addCoins(this.gameManager.coins);
            if (this.gameManager.diamonds > 0) this.app.storage.setDiamonds(this.app.storage.getDiamonds() + this.gameManager.diamonds);
            this.backToMenu();
        });

        // Global pause from InputManager
        this.app.inputManager.onPause(() => {
            if (this.app.screenManager.getCurrent() === 'game' && !this.gameManager.gameOver) {
                this.togglePause();
            }
        });

        // Mobile D-pad
        const dirs = { 'up': {dx:0,dy:-1}, 'down': {dx:0,dy:1}, 'left': {dx:-1,dy:0}, 'right': {dx:1,dy:0} };
        this.element.querySelectorAll('.d-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const d = dirs[btn.dataset.dir];
                this.app.inputManager.direction = d;
            });
        });

        // Mobile Abilities
        this.element.querySelectorAll('.m-ab-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.app.inputManager.abilityPressed = parseInt(btn.dataset.id);
            });
        });
    }

    onEnter() {
        if (this.app.screenUtil.isMobile()) {
            this.mobileControls.classList.remove('hidden');
        } else {
            this.mobileControls.classList.add('hidden');
        }
    }

    startGame() {
        const selMapName = this.app.storage.load('selectedMap', 'FOREST');
        const mapList = getMapList();
        let mapType = mapList.find(m => m.name === selMapName) || mapList[0];
        
        const skinColor = this.app.storage.getSelectedSkin();
        const skinShape = this.app.storage.getSelectedShape();
        
        // Calculate dynamic cols/rows based on container size
        const wrapper = this.element.querySelector('.canvas-wrapper');
        const isMob = this.app.screenUtil.isMobile();
        const targetCellSize = isMob ? 16 : 25; // Smaller cells on mobile = more space
        
        this.cols = Math.floor(wrapper.clientWidth / targetCellSize) || 40;
        this.rows = Math.floor(wrapper.clientHeight / targetCellSize) || 25;

        // Ensure minimum grid size so snake doesn't get trapped immediately
        this.cols = Math.max(this.cols, 20);
        this.rows = Math.max(this.rows, 15);

        this.gameManager.init(this.cols, this.rows, mapType, skinColor, skinShape);
        
        // Slow down slightly on mobile to improve touch control handling
        if (isMob) {
            this.gameManager.baseTickInterval = 140; 
        } else {
            this.gameManager.baseTickInterval = 120;
        }
        this.mapRenderer.cols = this.cols;
        this.mapRenderer.rows = this.rows;
        
        this.paused = false;
        this.pauseOverlay.classList.add('hidden');
        this.gameOverOverlay.classList.add('hidden');
        
        this._updateFoodGuide(mapType);
        
        this.lastRenderTime = performance.now();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    togglePause() {
        if (this.gameManager.gameOver) return;
        this.paused = !this.paused;
        if (this.paused) {
            this.pauseOverlay.classList.remove('hidden');
            this.app.soundManager.pauseBgm();
        } else {
            this.pauseOverlay.classList.add('hidden');
            this.app.soundManager.resumeBgm();
            this.lastRenderTime = performance.now();
            this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
        }
    }

    backToMenu() {
        this.paused = true;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.app.soundManager.stopCurrentBgm();
        
        // Save coins and diamonds collected even if quit
        if (!this.gameManager.gameOver) {
            if (this.gameManager.coins > 0) {
                this.app.storage.addCoins(this.gameManager.coins);
                this.gameManager.coins = 0;
            }
            if (this.gameManager.diamonds > 0) {
                this.app.storage.setDiamonds(this.app.storage.getDiamonds() + this.gameManager.diamonds);
                this.gameManager.diamonds = 0;
            }
        }
        
        this.app.screenManager.showScreen('menu');
    }

    loop(timestamp) {
        if (this.paused) return;

        const deltaTime = timestamp - this.lastRenderTime;
        this.lastRenderTime = timestamp;

        // Resize canvas if needed
        const wrapper = this.element.querySelector('.canvas-wrapper');
        let cellSize = Math.floor(Math.min(wrapper.clientWidth / this.cols, wrapper.clientHeight / this.rows));
        if (cellSize < 5) cellSize = 5; // Minimum size to prevent invisible canvas
        const cw = this.cols * cellSize;
        const ch = this.rows * cellSize;
        if (this.canvas.width !== cw || this.canvas.height !== ch) {
            this.canvas.width = cw;
            this.canvas.height = ch;
        }

        // Update logic
        this.gameManager.update(deltaTime, this.app.inputManager);
        
        // Render
        this.draw(cellSize);
        this.drawHUD();

        if (this.gameManager.gameOver) {
            // Save stats for missions
            this.app.storage.addStat('totalMatches', 1);
            this.app.storage.updateDailyQuestProgress('totalMatches', 1);
            
            this.app.storage.addStat('totalFood', this.gameManager.foodEaten);
            this.app.storage.updateDailyQuestProgress('totalFood', this.gameManager.foodEaten);
            
            this.app.storage.addStat('totalAbilities', this.gameManager.abilitiesUsed);
            this.app.storage.updateDailyQuestProgress('totalAbilities', this.gameManager.abilitiesUsed);

            this.gameOverOverlay.classList.remove('hidden');
            this.element.querySelector('#goScore').innerText = this.gameManager.score;
            return; // Stop loop
        }

        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    draw(cellSize) {
        // 1. Map & Background
        this.mapRenderer.render(this.ctx, this.gameManager.currentMap, cellSize, this.canvas.width, this.canvas.height);
        
        // 2. Items
        this.gameManager.items.forEach(it => it.draw(this.ctx, cellSize));
        
        // 3. Walls
        this.mapRenderer.drawWalls(this.ctx, this.gameManager.walls, cellSize, this.gameManager.currentMap);
        
        // 4. Snake
        this.gameManager.snake.draw(this.ctx, cellSize, this.gameManager.skinDef);
    }

    drawHUD() {
        this.hudScore.innerText = this.gameManager.score;
        this.hudCoins.innerText = this.gameManager.coins;
        
        if (this.hudMapName.innerText !== this.gameManager.currentMap.displayName) {
            this.hudMapName.innerText = this.gameManager.currentMap.displayName;
            this._updateFoodGuide(this.gameManager.currentMap);
        }
        
        const hp = this.gameManager.snake.health;
        this.hudHp.innerText = hp;
        this.hudHpBar.style.width = `${hp}%`;
        if (hp <= 30) this.hudHpBar.style.backgroundColor = '#f44336';
        else this.hudHpBar.style.backgroundColor = '#4caf50';

        // Abilities
        const am = this.gameManager.abilityManager;
        Object.values(ABILITY_TYPES).forEach(a => {
            const slot = this.element.querySelector(`#ab-slot-${a.id}`);
            if (!slot) return;
            const actFill = slot.querySelector(`#ab-act-${a.id}`);
            
            // Check affordability
            const canAfford = this.gameManager.coins >= a.cost;
            const isActive = am.activeAbility === a.id;
            
            if (!canAfford && !isActive) {
                slot.style.opacity = '0.5';
            } else {
                slot.style.opacity = '1';
            }
            
            // Active bar
            if (isActive) {
                slot.classList.add('active');
                const pct = Math.max(0, (am.activeDuration / am.maxDuration) * 100);
                actFill.style.width = `${pct}%`;
                actFill.style.backgroundColor = '#ffffff';
            } else {
                slot.classList.remove('active');
                actFill.style.width = '0%';
            }
        });
    }

    _updateFoodGuide(mapType) {
        const foodHtml = mapType.foodTypes.map(f => `<div style="font-size: 0.9em; margin-bottom: 2px;">${f.emoji} ${f.name} (+${f.points} Poin, +${f.coins} Koin)</div>`).join('');
        const extraHtml = `
            <div style="font-size: 0.85em; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 4px;">
                <div style="margin-bottom: 2px;">💚 Ramuan (+10 HP)</div>
                <div style="margin-bottom: 2px;">☠️ Racun (-10 HP)</div>
                <div style="margin-bottom: 2px;">💎 Diamond Fruit (+1 Diamond)</div>
                <div style="margin-bottom: 2px;">🌀 Buah Portal (Pindah Map)</div>
            </div>
        `;
        this.element.querySelector('#hudFoodGuide').innerHTML = foodHtml + extraHtml;
    }
}
