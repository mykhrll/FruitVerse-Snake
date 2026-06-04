// ============================================
// CloudSyncService — Handles Firebase cloud synchronization
// ============================================
export class CloudSyncService {
    constructor(localService) {
        this.localService = localService;
        
        // Setup local storage to report changes back to cloud
        this.localService.setSyncCallback((key, data) => {
            this.syncToCloud(key, data);
        });
    }

    _getDb() {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            return firebase.database();
        }
        return null;
    }

    async initCloudProfile(playerName) {
        // Assume playerName is already set in localService
        const db = this._getDb();
        if (!db) return;

        const safeKey = playerName.replace(/[.#$\[\]]/g, '_');
        const snap = await db.ref('users/' + safeKey).once('value');
        const data = snap.val();
        
        if (data) {
            if (data.coins !== undefined) this.localService.save('coins', data.coins);
            if (data.diamonds !== undefined) this.localService.save('diamonds', data.diamonds);
            
            if (data.ownedSkins) {
                const local = this.localService.load('ownedSkins', ['classic_green']);
                const merged = [...new Set([...local, ...data.ownedSkins])];
                this.localService.save('ownedSkins', merged);
            }
            if (data.selectedSkin) this.localService.save('selectedSkin', data.selectedSkin);
            
            if (data.ownedShapes) {
                const local = this.localService.load('ownedShapes', ['round']);
                const merged = [...new Set([...local, ...data.ownedShapes])];
                this.localService.save('ownedShapes', merged);
            }
            if (data.selectedShape) this.localService.save('selectedShape', data.selectedShape);
            
            if (data.stats) this.localService.save('stats', data.stats);
            if (data.achievements) this.localService.save('achievements', data.achievements);
            
            if (data.dailyQuests) {
                const localData = this.localService.load('dailyQuests', null);
                if (!localData || data.dailyQuests.date === localData.date) {
                    this.localService.save('dailyQuests', data.dailyQuests);
                }
            }
        }
    }

    syncToCloud(key, data) {
        const db = this._getDb();
        const playerName = this.localService.getPlayerName();
        if (!db || !playerName) return;
        
        const safeKey = playerName.replace(/[.#$\[\]]/g, '_');
        db.ref(`users/${safeKey}/${key}`).set(data);
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
        const localData = this.localService.load('dailyQuests', null);
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
        
        this.localService.save('dailyQuests', { date: today, quests });
        return quests;
    }
}
