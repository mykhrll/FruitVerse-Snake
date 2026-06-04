// ============================================
// ItemFactory — Factory pattern for creating items
// Equivalent to Java ItemFactory
// ============================================
import { AppleFood, BerryFood, MushroomFood, CactusFruitFood, DateFood, MelonFood, CandyCaneFood, CocoaFood, PixelCandyFood, OrbFood, FallbackFood } from './Food.js';
import { Potion } from './Potion.js';
import { Poison } from './Poison.js';
import { PortalFruit } from './PortalFruit.js';
import { DiamondFruit } from './DiamondFruit.js';

export class ItemFactory {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
    }

    /**
     * Get a random free position not occupied by snake or existing items or walls
     */
    _getRandomPos(snake, items, walls) {
        let x, y;
        let attempts = 0;
        do {
            // Stay inside walls (1 to cols-2, 1 to rows-2)
            x = 1 + Math.floor(Math.random() * (this.cols - 2));
            y = 1 + Math.floor(Math.random() * (this.rows - 2));
            attempts++;
            if (attempts > 500) break;
        } while (
            snake.isAt(x, y) ||
            items.some(it => it.alive && it.x === x && it.y === y) ||
            walls.some(([wx, wy]) => wx === x && wy === y)
        );
        return { x, y };
    }

    createFood(mapType, snake, items, walls) {
        const foodTypes = mapType.foodTypes;
        const foodDef = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        const pos = this._getRandomPos(snake, items, walls);
        
        switch (foodDef.name) {
            case 'Apple':
            case 'Ghost Apple': return new AppleFood(pos.x, pos.y, foodDef);
            case 'Berry':
            case 'Frozen Berry':
            case 'Moon Berry': return new BerryFood(pos.x, pos.y, foodDef);
            case 'Mushroom': return new MushroomFood(pos.x, pos.y, foodDef);
            case 'Cactus Fruit': return new CactusFruitFood(pos.x, pos.y, foodDef);
            case 'Date': return new DateFood(pos.x, pos.y, foodDef);
            case 'Melon': return new MelonFood(pos.x, pos.y, foodDef);
            case 'Candy Cane': return new CandyCaneFood(pos.x, pos.y, foodDef);
            case 'Hot Cocoa': return new CocoaFood(pos.x, pos.y, foodDef);
            case 'Pixel Candy': return new PixelCandyFood(pos.x, pos.y, foodDef);
            case 'Energy Orb':
            case 'Neon Fruit':
            case 'Shadow Fruit': return new OrbFood(pos.x, pos.y, foodDef);
            default: return new FallbackFood(pos.x, pos.y, foodDef);
        }
    }

    createPotion(mapType, snake, items, walls) {
        const pos = this._getRandomPos(snake, items, walls);
        return new Potion(pos.x, pos.y, mapType);
    }

    createPoison(mapType, snake, items, walls) {
        const pos = this._getRandomPos(snake, items, walls);
        return new Poison(pos.x, pos.y, mapType);
    }

    createPortalFruit(snake, items, walls) {
        const pos = this._getRandomPos(snake, items, walls);
        return new PortalFruit(pos.x, pos.y);
    }

    createDiamondFruit(snake, items, walls) {
        const pos = this._getRandomPos(snake, items, walls);
        return new DiamondFruit(pos.x, pos.y);
    }
}
