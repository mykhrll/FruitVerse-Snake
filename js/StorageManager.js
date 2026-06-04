// ============================================
// StorageManager — localStorage persistence
// ============================================
export class StorageManager {
    constructor(prefix = 'fruitverse_') {
        this.prefix = prefix;
        this.playerName = this.load('playerName', 'Player');
    }

    _getDb() {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            return firebase.database();
        }
        return null;
    }

    async initCloudProfile(playerName) {
        this.playerName = playerName;
        const db = this._getDb();
        if (!db) return;

        const safeKey = playerName.replace(/[.#$\[\]]/g, '_');
        const snap = await db.ref('users/' + safeKey).once('value');
        const data = snap.val();
        if (data) {
            if (data.coins !== undefined) this.save('coins', data.coins);
            if (data.diamonds !== undefined) this.save('diamonds', data.diamonds);
            if (data.ownedSkins) {
                const local = this.load('ownedSkins', ['classic_green']);
                const merged = [...new Set([...local, ...data.ownedSkins])];
                this.save('ownedSkins', merged);
            }
            if (data.selectedSkin) this.save('selectedSkin', data.selectedSkin);
            
            if (data.ownedShapes) {
                const local = this.load('ownedShapes', ['round']);
                const merged = [...new Set([...local, ...data.ownedShapes])];
                this.save('ownedShapes', merged);
            }
            if (data.selectedShape) this.save('selectedShape', data.selectedShape);
            
            if (data.stats) this.save('stats', data.stats);
            if (data.achievements) this.save('achievements', data.achievements);
            
            // For daily quests, we rely on fetchGlobalDailyQuests to merge, but we can load from profile here first
            if (data.dailyQuests) {
                const localData = this.load('dailyQuests', null);
                if (!localData || data.dailyQuests.date === localData.date) {
                    this.save('dailyQuests', data.dailyQuests);
                }
            }
        }
    }

    _syncToCloud(key, data) {
        const db = this._getDb();
        if (!db || !this.playerName) return;
        const safeKey = this.playerName.replace(/[.#$\[\]]/g, '_');
        db.ref(`users/${safeKey}/${key}`).set(data);
    }

    save(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            if (key !== 'playerName' && key !== 'leaderboard') {
                this._syncToCloud(key, data);
            }
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
        return this.playerName;
    }

    async setPlayerName(name) {
        this.save('playerName', name);
        this.playerName = name; // Update it before calling initCloudProfile
        await this.initCloudProfile(name); // Always force sync on login
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
    
    async fetchGlobalDailyQuests() {
        const db = this._getDb();
        const today = new Date().toDateString();
        
        const templates = [
            { id: 'q1', title: 'Makan 20 Makanan', target: 20, type: 'totalFood', reward: 15 },
            { id: 'q2', title: 'Main 3 Kali', target: 3, type: 'totalMatches', reward: 10 },
            { id: 'q3', title: 'Gunakan Kekuatan 5 Kali', target: 5, type: 'totalAbilities', reward: 20 },
            { id: 'q4', title: 'Makan 50 Makanan', target: 50, type: 'totalFood', reward: 30 },
            { id: 'q5', title: 'Gunakan Kekuatan 10 Kali', target: 10, type: 'totalAbilities', reward: 40 },
            { id: 'q6', title: 'Main 5 Kali', target: 5, type: 'totalMatches', reward: 25 },
            { id: 'q7', title: 'Makan 100 Makanan', target: 100, type: 'totalFood', reward: 50 },
        ];

        let quests = [];

        if (db) {
            const snap = await db.ref('global/dailyQuests').once('value');
            const data = snap.val();
            
            if (data && data.date === today) {
                quests = data.quests;
            } else {
                // Generate new
                const shuffled = templates.sort(() => 0.5 - Math.random());
                quests = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
                db.ref('global/dailyQuests').set({ date: today, quests });
            }
        } else {
            const shuffled = templates.sort(() => 0.5 - Math.random());
            quests = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
        }
        
        // Merge with local progress to prevent overwriting user progress
        const localData = this.load('dailyQuests', null);
        if (localData && localData.date === today) {
            quests.forEach(q => {
                const lq = localData.quests.find(x => x.id === q.id);
                if (lq) {
                    q.progress = lq.progress;
                    q.completed = lq.completed;
                    q.claimed = lq.claimed;
                }
            });
        }
        
        // Save to local profile (which also syncs to user's cloud profile)
        this.save('dailyQuests', { date: today, quests });
        return quests;
    }
    
    getDailyQuests() {
        const data = this.load('dailyQuests', null);
        const today = new Date().toDateString();
        
        if (!data || data.date !== today) {
            // Need async fetch, but return empty for now, UI should await fetchGlobalDailyQuests
            return [];
        }
        return data.quests;
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
