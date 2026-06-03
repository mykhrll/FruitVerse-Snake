// ============================================
// StorageManager — localStorage persistence
// ============================================
export class StorageManager {
    constructor(prefix = 'fruitverse_') {
        this.prefix = prefix;
    }

    save(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
        } catch (e) {
            console.warn('StorageManager: Failed to save', key, e);
        }
    }

    load(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(this.prefix + key);
            return raw !== null ? JSON.parse(raw) : defaultValue;
        } catch (e) {
            console.warn('StorageManager: Failed to load', key, e);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    // ---- Convenience methods ----

    getPlayerName() {
        return this.load('playerName', 'Player');
    }

    setPlayerName(name) {
        this.save('playerName', name);
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
        
        // If no quests or it's a new day, generate new ones
        if (!data || data.date !== today) {
            return this.generateDailyQuests(today);
        }
        return data.quests;
    }
    
    generateDailyQuests(today) {
        // Generate random quests
        const templates = [
            { id: 'q1', title: 'Makan 20 Makanan', target: 20, type: 'totalFood', reward: 15 },
            { id: 'q2', title: 'Main 3 Kali', target: 3, type: 'totalMatches', reward: 10 },
            { id: 'q3', title: 'Gunakan Kekuatan 5 Kali', target: 5, type: 'totalAbilities', reward: 20 },
            { id: 'q4', title: 'Makan 50 Makanan', target: 50, type: 'totalFood', reward: 30 }
        ];
        
        // Pick 3 unique random quests
        const shuffled = templates.sort(() => 0.5 - Math.random());
        const quests = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
        
        this.save('dailyQuests', { date: today, quests });
        return quests;
    }
    
    updateDailyQuestProgress(type, amount) {
        const data = this.load('dailyQuests', null);
        const today = new Date().toDateString();
        if (!data || data.date !== today) return; // Wait for user to open missions screen to regenerate
        
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
            ach[id] = true; // marked as claimed
            this.addDiamonds(reward);
            this.save('achievements', ach);
            return true;
        }
        return false;
    }
}
