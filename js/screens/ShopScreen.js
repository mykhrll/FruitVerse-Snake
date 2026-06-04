// ============================================
// ShopScreen — Skin and shape store
// ============================================

const SKINS = [
    { id: 'classic_green', name: 'Classic Green', price: 0, type: 'color', color: '#4caf50' },
    { id: 'ocean_blue', name: 'Ocean Blue', price: 50, type: 'color', color: '#29b6f6' },
    { id: 'flame_red', name: 'Flame Red', price: 50, type: 'color', color: '#ef5350' },
    { id: 'royal_purple', name: 'Royal Purple', price: 75, type: 'color', color: '#ab47bc' },
    { id: 'golden', name: 'Golden', price: 100, type: 'color', color: '#ffd54f' },
    { id: 'crimson_dark', name: 'Crimson Dark', price: 120, type: 'color', color: '#b71c1c' },
    { id: 'cyan_glow', name: 'Cyan Glow', price: 150, type: 'color', color: '#00e5ff' },
    { id: 'rainbow', name: 'Rainbow', price: 250, type: 'color', color: 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)' },
];

const SHAPES = [
    { id: 'round', name: 'Round', price: 0, type: 'shape', preview: 'border-radius: 50%;' },
    { id: 'square', name: 'Square', price: 5, type: 'shape', preview: 'border-radius: 4px;' },
    { id: 'diamond', name: 'Diamond', price: 10, type: 'shape', preview: 'transform: rotate(45deg); border-radius: 2px;' },
    { id: 'leaf', name: 'Leaf', price: 15, type: 'shape', preview: 'border-radius: 0 50% 0 50%;' },
    { id: 'neon_glow', name: 'Neon Glow', price: 25, type: 'shape', preview: 'border-radius: 50%; box-shadow: 0 0 15px #fff;' },
];

export class ShopScreen {
    constructor(element, app) {
        this.element = element;
        this.app = app;
        
        this.element.innerHTML = `
            <div class="shop-wrapper">
                <div class="shop-container glass-panel">
                    <div class="shop-header">
                        <h2>Shop</h2>
                        <div style="display: flex; gap: 15px;">
                            <div class="shop-coins">🪙 <span id="shopCoinsVal">0</span></div>
                            <div class="shop-coins">💎 <span id="shopDiamondsVal">0</span></div>
                        </div>
                    </div>
                    
                    <div class="shop-content">
                        <h3>Snake Colors</h3>
                        <div class="shop-grid" id="skinGrid"></div>
                        
                        <h3 style="margin-top:20px;">Snake Shapes</h3>
                        <div class="shop-grid" id="shapeGrid"></div>
                    </div>
                    
                    <div class="shop-footer">
                        <button class="btn btn-secondary" id="btnShopBack">◀ Back to Menu</button>
                    </div>
                </div>
            </div>
        `;

        this.element.querySelector('#btnShopBack').addEventListener('click', () => {
            this.app.screenManager.showScreen('menu');
        });
    }

    updateUI() {
        const coins = this.app.localService.getCoins();
        const diamonds = this.app.localService.getDiamonds();
        this.element.querySelector('#shopCoinsVal').innerText = coins;
        this.element.querySelector('#shopDiamondsVal').innerText = diamonds;
        
        const ownedSkins = this.app.localService.getOwnedSkins();
        const selectedSkin = this.app.localService.getSelectedSkin();
        
        const ownedShapes = this.app.localService.getOwnedShapes();
        const selectedShape = this.app.localService.getSelectedShape();

        // Render Colors
        const skinGrid = this.element.querySelector('#skinGrid');
        skinGrid.innerHTML = SKINS.map(item => this._createShopCard(item, ownedSkins, selectedSkin, coins)).join('');
        
        // Render Shapes (uses diamonds)
        const shapeGrid = this.element.querySelector('#shapeGrid');
        shapeGrid.innerHTML = SHAPES.map(item => this._createShopCard(item, ownedShapes, selectedShape, diamonds)).join('');

        // Bind buy/equip buttons
        this.element.querySelectorAll('.shop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                this.handleAction(id, type);
            });
        });
    }

    _createShopCard(item, ownedList, selectedId, currentCoins) {
        const isOwned = ownedList.includes(item.id);
        const isSelected = selectedId === item.id;
        const canAfford = currentCoins >= item.price;
        
        let btnHtml = '';
        const currencySym = item.type === 'color' ? '🪙' : '💎';
        if (isSelected) {
            btnHtml = `<button class="btn shop-btn equipped" disabled>Equipped</button>`;
        } else if (isOwned) {
            btnHtml = `<button class="btn btn-primary shop-btn" data-id="${item.id}" data-type="${item.type}">Equip</button>`;
        } else {
            btnHtml = `<button class="btn ${canAfford ? 'btn-secondary' : 'disabled'} shop-btn" data-id="${item.id}" data-type="${item.type}" ${!canAfford ? 'disabled' : ''}>Buy (${item.price} ${currencySym})</button>`;
        }

        const previewStyle = item.type === 'color' 
            ? `background: ${item.color}; border-radius: 50%;` 
            : `background: #4caf50; ${item.preview}`;

        return `
            <div class="shop-card ${isSelected ? 'selected' : ''}">
                <div class="shop-preview">
                    <div class="preview-item" style="${previewStyle}"></div>
                </div>
                <div class="shop-item-name">${item.name}</div>
                ${btnHtml}
            </div>
        `;
    }

    handleAction(id, type) {
        let itemDef = type === 'color' ? SKINS.find(s => s.id === id) : SHAPES.find(s => s.id === id);
        if (!itemDef) return;

        let ownedList = type === 'color' ? this.app.localService.getOwnedSkins() : this.app.localService.getOwnedShapes();
        
        if (ownedList.includes(id)) {
            // Equip
            if (type === 'color') this.app.localService.setSelectedSkin(id);
            else this.app.localService.setSelectedShape(id);
        } else {
            // Buy
            let bal = type === 'color' ? this.app.localService.getCoins() : this.app.localService.getDiamonds();
            if (bal >= itemDef.price) {
                if (type === 'color') {
                    this.app.localService.setCoins(bal - itemDef.price);
                    ownedList.push(id);
                    this.app.localService.setOwnedSkins(ownedList);
                    this.app.localService.setSelectedSkin(id);
                } else {
                    this.app.localService.setDiamonds(bal - itemDef.price);
                    ownedList.push(id);
                    this.app.localService.setOwnedShapes(ownedList);
                    this.app.localService.setSelectedShape(id);
                }
            }
        }
        
        this.updateUI(); // refresh
    }
}
