// ============================================
// LocalStorageService — Manages local browser storage
// ============================================
export class LocalStorageService {
    constructor(prefix = 'fruitverse_') {
        this.prefix = prefix;
        this.playerName = this.load('playerName', 'Player');
        this.syncCallback = null; // Hook for cloud sync
    }

    setSyncCallback(cb) {
        this.syncCallback = cb;
    }

    save(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            if (key !== 'playerName' && key !== 'leaderboard' && this.syncCallback) {
                this.syncCallback(key, data);
            }
        } catch (e) {
            console.warn('LocalStorageService: Failed to save', key, e);
        }
    }

    load(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(this.prefix + key);
            return raw !== null ? JSON.parse(raw) : defaultValue;
        } catch (e) {
            console.warn('LocalStorageService: Failed to load', key, e);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    // ---- Convenience methods ----

    getPlayerName() {
        return this.playerName;
    }

    setPlayerName(name) {
        this.save('playerName', name);
        this.playerName = name; 
    }

    getCoins() {
        const val = localStorage.getItem(this.prefix + 'coins');
        if (val === null) {
            this.setCoins(100);
            return 100;
        }
        return this.load('coins', 0);
    }

    setCoins(val) {
        this.save('coins', val);
    }

    addCoins(val) {
        this.setCoins(this.getCoins() + val);
        if (val > 0) this.addStat('totalCoins', val);
    }

    getOwnedSkins() {
        return this.load('ownedSkins', ['classic_green']);
    }

    setOwnedSkins(skins) {
        this.save('ownedSkins', skins);
    }

    getSelectedSkin() {
        return this.load('selectedSkin', 'classic_green');
    }

    setSelectedSkin(skin) {
        this.save('selectedSkin', skin);
    }

    getOwnedShapes() {
        return this.load('ownedShapes', ['round']);
    }

    setOwnedShapes(shapes) {
        this.save('ownedShapes', shapes);
    }

    getSelectedShape() {
        return this.load('selectedShape', 'round');
    }

    setSelectedShape(shape) {
        this.save('selectedShape', shape);
    }
    
    // ---- New Currencies and Missions ----
    
    getDiamonds() {
        const val = localStorage.getItem(this.prefix + 'diamonds');
        if (val === null) {
            this.setDiamonds(5); // Initial balance
            return 5;
        }
        return this.load('diamonds', 0);
    }
    
    setDiamonds(val) { this.save('diamonds', val); }
    addDiamonds(val) { this.setDiamonds(this.getDiamonds() + val); }
    
    getStats() {
        return this.load('stats', { totalFood: 0, totalMatches: 0, totalAbilities: 0 });
    }
    
    addStat(key, amount) {
        const stats = this.getStats();
        if (stats[key] === undefined) stats[key] = 0;
        stats[key] += amount;
        this.save('stats', stats);
    }
    
    getDailyQuests() {
        const data = this.load('dailyQuests', null);
        const today = new Date().toDateString();
        
        if (!data || data.date !== today) {
            return [];
        }
        return data.quests;
    }
    
    updateDailyQuestProgress(type, amount) {
        const data = this.load('dailyQuests', null);
        const today = new Date().toDateString();
        if (!data || data.date !== today) return; 
        
        let updated = false;
        data.quests.forEach(q => {
            if (q.type === type && !q.completed) {
                q.progress += amount;
                if (q.progress >= q.target) {
                    q.progress = q.target;
                    q.completed = true;
                }
                updated = true;
            }
        });
        
        if (updated) this.save('dailyQuests', data);
    }
    
    claimDailyQuest(id) {
        const data = this.load('dailyQuests', null);
        if (!data) return false;
        
        const q = data.quests.find(x => x.id === id);
        if (q && q.completed && !q.claimed) {
            q.claimed = true;
            this.addCoins(q.reward);
            this.save('dailyQuests', data);
            return true;
        }
        return false;
    }
    
    getAchievements() {
        return this.load('achievements', {});
    }
    
    claimAchievement(id, reward) {
        const ach = this.getAchievements();
        if (!ach[id]) {
            ach[id] = true; 
            this.addDiamonds(reward);
            this.save('achievements', ach);
            return true;
        }
        return false;
    }
}
