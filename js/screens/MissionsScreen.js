// ============================================
// MissionsScreen — Daily Quests & Achievements
// ============================================

export class MissionsScreen {
    constructor(element, app) {
        this.element = element;
        this.app = app;
        this.currentTab = 'quests';
        
        this.element.innerHTML = `
            <div class="htp-wrapper">
                <div class="htp-container glass-panel" style="max-width: 650px;">
                    <h2>🎯 MISI & PENCAPAIAN</h2>
                    
                    <div class="missions-tabs">
                        <button class="tab-btn active" id="btnTabQuests">Misi Harian</button>
                        <button class="tab-btn" id="btnTabAchievements">Pencapaian</button>
                    </div>

                    <div class="missions-content" id="missionsContent">
                        <!-- Populated by JS -->
                    </div>

                    <div class="htp-footer">
                        <button class="btn btn-danger" id="btnMissionsBack">◀ Kembali</button>
                    </div>
                </div>
            </div>
        `;

        this.content = this.element.querySelector('#missionsContent');
        this.btnTabQuests = this.element.querySelector('#btnTabQuests');
        this.btnTabAchievements = this.element.querySelector('#btnTabAchievements');

        this._bindEvents();
    }

    _bindEvents() {
        this.element.querySelector('#btnMissionsBack').addEventListener('click', () => {
            this.app.screenManager.showScreen('menu');
        });

        this.btnTabQuests.addEventListener('click', () => {
            this.currentTab = 'quests';
            this.updateUI();
        });

        this.btnTabAchievements.addEventListener('click', () => {
            this.currentTab = 'achievements';
            this.updateUI();
        });
    }

    updateUI() {
        if (this.currentTab === 'quests') {
            this.btnTabQuests.classList.add('active');
            this.btnTabAchievements.classList.remove('active');
            this._renderQuests();
        } else {
            this.btnTabAchievements.classList.add('active');
            this.btnTabQuests.classList.remove('active');
            this._renderAchievements();
        }
    }

    _renderQuests() {
        const quests = this.app.storage.getDailyQuests();
        let html = '';
        
        quests.forEach(q => {
            const pct = Math.min(100, (q.progress / q.target) * 100);
            
            let actionHtml = '';
            if (q.claimed) {
                actionHtml = `<span style="color: #4caf50;">Diambil ✓</span>`;
            } else if (q.completed) {
                actionHtml = `<button class="btn btn-primary mission-btn claim-quest-btn" data-id="${q.id}">Klaim</button>`;
            } else {
                actionHtml = `<span style="color: #aaa;">Belum Selesai</span>`;
            }

            html += `
                <div class="mission-card ${q.completed ? 'completed' : ''}">
                    <div class="mission-icon">📜</div>
                    <div class="mission-info">
                        <div class="mission-title">${q.title}</div>
                        <div class="mission-prog">${q.progress} / ${q.target}</div>
                        <div class="mission-prog-bar">
                            <div class="mission-prog-fill" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    <div class="mission-reward">
                        <div class="mission-reward-val">+${q.reward} 🪙</div>
                        ${actionHtml}
                    </div>
                </div>
            `;
        });
        
        this.content.innerHTML = html;
        
        // Bind claim buttons
        this.element.querySelectorAll('.claim-quest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (this.app.storage.claimDailyQuest(id)) {
                    this.updateUI();
                }
            });
        });
    }

    _renderAchievements() {
        const stats = this.app.storage.getStats();
        const claimedAch = this.app.storage.getAchievements();
        
        const achList = [
            { id: 'a1', title: 'Pemula', desc: 'Main 10 Kali', target: 10, type: 'totalMatches', reward: 1 },
            { id: 'a2', title: 'Rakus', desc: 'Makan 500 Makanan', target: 500, type: 'totalFood', reward: 2 },
            { id: 'a3', title: 'Penguasa Waktu', desc: 'Gunakan Kekuatan 100 Kali', target: 100, type: 'totalAbilities', reward: 3 },
            { id: 'a4', title: 'Veteran', desc: 'Main 100 Kali', target: 100, type: 'totalMatches', reward: 5 }
        ];

        let html = '';
        
        achList.forEach(a => {
            const current = stats[a.type] || 0;
            const pct = Math.min(100, (current / a.target) * 100);
            const isCompleted = current >= a.target;
            const isClaimed = !!claimedAch[a.id];
            
            let actionHtml = '';
            if (isClaimed) {
                actionHtml = `<span style="color: #4caf50;">Diambil ✓</span>`;
            } else if (isCompleted) {
                actionHtml = `<button class="btn btn-primary mission-btn claim-ach-btn" data-id="${a.id}" data-reward="${a.reward}">Klaim</button>`;
            } else {
                actionHtml = `<span style="color: #aaa;">Belum Selesai</span>`;
            }

            html += `
                <div class="mission-card ${isCompleted ? 'completed' : ''}">
                    <div class="mission-icon">🏆</div>
                    <div class="mission-info">
                        <div class="mission-title">${a.title}</div>
                        <div class="mission-prog" style="color: #ccc; margin-bottom: 2px;">${a.desc}</div>
                        <div class="mission-prog">${current} / ${a.target}</div>
                        <div class="mission-prog-bar">
                            <div class="mission-prog-fill" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    <div class="mission-reward">
                        <div class="mission-reward-val">+${a.reward} 💎</div>
                        ${actionHtml}
                    </div>
                </div>
            `;
        });
        
        this.content.innerHTML = html;
        
        this.element.querySelectorAll('.claim-ach-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const reward = parseInt(e.target.dataset.reward);
                if (this.app.storage.claimAchievement(id, reward)) {
                    this.updateUI();
                }
            });
        });
    }

    onEnter() {
        this.updateUI();
    }
}
