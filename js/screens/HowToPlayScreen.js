// ============================================
// HowToPlayScreen — Guide and rules
// ============================================
import { ABILITY_TYPES } from '../game/AbilityManager.js';
import { getMapList } from '../game/maps/MapType.js';

export class HowToPlayScreen {
    constructor(element, app) {
        this.element = element;
        this.app = app;
        
        const mapList = getMapList();
        const mapHtml = mapList.map(m => `
            <div class="htp-map-card" style="border-left: 4px solid ${m.accentColor}">
                <h4>${m.displayName}</h4>
                <p>Foods: ${m.foodTypes.map(f => `${f.emoji} ${f.name} (+${f.points})`).join(', ')}</p>
            </div>
        `).join('');

        const abHtml = Object.values(ABILITY_TYPES).map((a, idx) => `
            <div class="htp-ab-card">
                <span style="font-size: 1.5em; color: ${a.color}">${a.icon}</span>
                <div><strong>${a.name} (Key ${idx + 1})</strong><br><small>${a.desc}</small></div>
            </div>
        `).join('');

        this.element.innerHTML = `
            <div class="htp-container glass-panel">
                <h2>Cara Bermain</h2>
                
                <div class="htp-scroll-area">
                    <section>
                        <h3>🎮 Kontrol</h3>
                        <p><strong>Desktop:</strong> Gunakan <code>W A S D</code> atau <code>Tombol Panah</code> untuk bergerak. Tekan <code>Spasi</code> untuk jeda (pause).</p>
                        <p><strong>Mobile:</strong> Gunakan tombol arah (D-Pad) di layar.</p>
                    </section>

                    <section>
                        <h3>✨ Kekuatan / Ability (Durasi: 15 detik)</h3>
                        <p>Tekan <code>1 2 3 4</code> di keyboard atau ketuk ikon di layar HP. <strong>Pastikan kamu punya koin yang cukup!</strong></p>
                        <div class="htp-grid">${abHtml}</div>
                    </section>

                    <section>
                        <h3>🍎 Item & Aturan</h3>
                        <ul>
                            <li>💚 <strong>Ramuan:</strong> Menambah +10 HP</li>
                            <li>☠️ <strong>Racun:</strong> Mengurangi -10 HP</li>
                            <li>🌀 <strong>Buah Portal:</strong> Muncul setiap 60 detik. Makan untuk pindah map (+50 poin, +5 koin)</li>
                            <li>💎 <strong>Buah Diamond:</strong> Buah langka yang memberikan +1 Diamond untuk membeli bentuk ular!</li>
                            <li>⚠️ <strong>Menabrak Batas Map:</strong> -5 HP terus-menerus</li>
                            <li>⚠️ <strong>Menabrak Diri Sendiri:</strong> -20 HP</li>
                        </ul>
                    </section>

                    <section>
                        <h3>🗺️ Peta & Makanan</h3>
                        ${mapHtml}
                    </section>
                </div>
                
                <div class="htp-footer">
                    <button class="btn btn-secondary" id="btnHtpBack">◀ Kembali ke Menu</button>
                </div>
            </div>
        `;

        this.element.querySelector('#btnHtpBack').addEventListener('click', () => {
            this.app.screenManager.showScreen('menu');
        });
    }
}
