// ============================================
// AbilityManager — Handles active abilities without cooldowns
// ============================================

export const ABILITY_TYPES = {
    1: { id: 'slow', name: 'Waktu Melambat', duration: 15000, cost: 15, icon: '⏱️', color: '#ffeb3b', desc: 'Memperlambat gerakan permainan selama 15 detik.' },
    2: { id: 'speed', name: 'Kecepatan', duration: 15000, cost: 15, icon: '⚡', color: '#00e5ff', desc: 'Meningkatkan kecepatan gerak ular secara drastis selama 15 detik.' },
    3: { id: 'magnet', name: 'Magnet Makanan', duration: 15000, cost: 20, icon: '🧲', color: '#f44336', desc: 'Menarik semua makanan di sekitar kepala ular selama 15 detik.' },
    4: { id: 'ghost', name: 'Tembus Tembok', duration: 15000, cost: 25, icon: '👻', color: '#ffffff', desc: 'Ular bisa menembus dinding dan badan sendiri tanpa terluka selama 15 detik.' },
};

export class AbilityManager {
    constructor() {
        this.activeAbility = null;
        this.activeDuration = 0; // ms
        this.maxDuration = 0;    // ms, for UI bar calculation
    }

    useAbility(key) {
        const abilityDef = ABILITY_TYPES[key];
        if (!abilityDef) return false;

        // If using the same ability, add duration. If different, replace and add duration.
        // Actually, the user said "menggantikan ability yang lama dan durasi nya bertambah"
        // So we switch to the new ability, but we KEEP the remaining duration and add the new duration!
        
        if (this.activeAbility) {
            this.activeDuration += abilityDef.duration;
            this.maxDuration += abilityDef.duration;
        } else {
            this.activeDuration = abilityDef.duration;
            this.maxDuration = abilityDef.duration;
        }
        
        this.activeAbility = abilityDef.id;
        return true; // Successfully activated
    }

    tick(dt) {
        if (this.activeAbility) {
            this.activeDuration -= dt;
            if (this.activeDuration <= 0) {
                this.activeAbility = null;
                this.activeDuration = 0;
                this.maxDuration = 0;
            }
        }
    }

    reset() {
        this.activeAbility = null;
        this.activeDuration = 0;
        this.maxDuration = 0;
    }
}
