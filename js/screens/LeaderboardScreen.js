// ============================================
// LeaderboardScreen — High scores display
// ============================================

export class LeaderboardScreen {
    constructor(element, app) {
        this.element = element;
        this.app = app;
        
        this.element.innerHTML = `
            <div class="leaderboard-container glass-panel">
                <h2>Top 10 Scores</h2>
                
                <div class="lb-table-container">
                    <table class="lb-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Score</th>
                                <th>Map</th>
                            </tr>
                        </thead>
                        <tbody id="lbTableBody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
                
                <div class="lb-footer">
                    <button class="btn btn-secondary" id="btnLbBack">◀ Back to Menu</button>
                </div>
            </div>
        `;

        this.element.querySelector('#btnLbBack').addEventListener('click', () => {
            this.app.screenManager.showScreen('menu');
        });
    }

    updateUI() {
        const top10 = this.app.leaderboard.getTop10();
        const tbody = this.element.querySelector('#lbTableBody');
        
        if (top10.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center">No scores yet!</td></tr>`;
            return;
        }

        tbody.innerHTML = top10.map((entry, index) => {
            let rankStr = `${index + 1}`;
            if (index === 0) rankStr = '🥇';
            if (index === 1) rankStr = '🥈';
            if (index === 2) rankStr = '🥉';
            
            return `
                <tr>
                    <td class="lb-rank">${rankStr}</td>
                    <td class="lb-name">${entry.name}</td>
                    <td class="lb-score">${entry.score}</td>
                    <td class="lb-map">${entry.map || '-'}</td>
                </tr>
            `;
        }).join('');
    }
}
