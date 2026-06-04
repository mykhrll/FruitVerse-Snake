// ============================================
// LeaderboardManager — Online scores using Firebase
// ============================================

export class LeaderboardManager {
    constructor(storage) {
        this.localService = storage;
        this.scores = [];
        this.db = null;

        // Note to User: Replace this with your actual Firebase config from Firebase Console
        const firebaseConfig = {
            apiKey: "AIzaSyDX6tz2YFEpaLxcrvbU9_coXOY--AwGrvo",
            authDomain: "fruitverse-snake.firebaseapp.com",
            databaseURL: "https://fruitverse-snake-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "fruitverse-snake",
            storageBucket: "fruitverse-snake.firebasestorage.app",
            messagingSenderId: "306894616890",
            appId: "1:306894616890:web:3edd5ee1bb9201601e3803",
            measurementId: "G-57XD7B9SWT"
        };

        // Initialize Firebase only if the user has provided a real config URL or if it's already configured
        if (typeof firebase !== 'undefined' && firebaseConfig.databaseURL && firebaseConfig.databaseURL !== "YOUR_DATABASE_URL") {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                this.db = firebase.database();
                this._fetchOnlineScores();
            } catch (error) {
                console.error("Firebase initialization error:", error);
                this._loadLocal(); // Fallback to local
            }
        } else {
            console.warn("Firebase not configured. Using local leaderboard storage. To use online leaderboard, update firebaseConfig in LeaderboardManager.js");
            this._loadLocal(); // Fallback to local
        }
    }

    _loadLocal() {
        this.scores = this.localService.load('leaderboard', []);
    }

    _fetchOnlineScores() {
        if (!this.db) return;
        
        const scoresRef = this.db.ref('leaderboard');
        // Listen for changes
        scoresRef.orderByChild('score').limitToLast(10).on('value', (snapshot) => {
            const data = snapshot.val();
            const tempScores = [];
            if (data) {
                for (const key in data) {
                    tempScores.push(data[key]);
                }
            }
            // Sort descending
            tempScores.sort((a, b) => b.score - a.score);
            this.scores = tempScores;
            
            // Also keep local backup
            this.localService.save('leaderboard', this.scores);
        });
    }

    addEntry(playerName, score, mapName) {
        if (score <= 0) return;

        const entry = {
            name: playerName,
            score: score,
            map: mapName,
            date: Date.now()
        };

        if (this.db) {
            // Push to Firebase Realtime Database
            // Sanitize key (Firebase keys cannot contain . # $ [ ] )
            const safeKey = playerName.replace(/[.#$\[\]]/g, '_');
            const playerRef = this.db.ref('leaderboard/' + safeKey);
            
            playerRef.once('value').then(snapshot => {
                const data = snapshot.val();
                if (!data || score > data.score) {
                    playerRef.set(entry);
                }
            });
        } else {
            // Local fallback
            const existingIdx = this.scores.findIndex(s => s.name === playerName);
            if (existingIdx >= 0) {
                if (score > this.scores[existingIdx].score) {
                    this.scores[existingIdx] = entry;
                }
            } else {
                this.scores.push(entry);
            }
            
            this.scores.sort((a, b) => b.score - a.score);
            if (this.scores.length > 10) {
                this.scores = this.scores.slice(0, 10);
            }
            this.localService.save('leaderboard', this.scores);
        }
    }

    getTop10() {
        return this.scores.slice(0, 10);
    }
}
