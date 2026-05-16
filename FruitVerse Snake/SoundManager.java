import javafx.scene.media.AudioClip;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class SoundManager {
    private AudioClip eatSound, healSound, damageSound, abilitySound, gameOverSound;
    private Map<String, MediaPlayer> bgmPlayers = new HashMap<>();
    private MediaPlayer currentBgm;
    private String currentBgmFile = null; // untuk cegah restart BGM yang sama
    private double bgmVolume = 0.45;
    private double sfxVolume = 0.75;

    public SoundManager() {
        try {
            File soundsDir = new File(System.getProperty("user.dir"), "sounds");
            if (!soundsDir.exists()) {
                System.err.println("Folder sounds/ tidak ditemukan!");
                return;
            }
            String base = soundsDir.toURI().toString() + "/";
            eatSound = loadClip(base, "eat.wav");
            healSound = loadClip(base, "heal.wav");
            damageSound = loadClip(base, "damage.wav");
            abilitySound = loadClip(base, "ability.wav");
            gameOverSound = loadClip(base, "gameover.wav");
            if (healSound == null) healSound = eatSound;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private AudioClip loadClip(String base, String file) {
        try {
            AudioClip clip = new AudioClip(base + file);
            clip.setVolume(sfxVolume);
            return clip;
        } catch (Exception e) {
            System.err.println("Gagal load " + file);
            return null;
        }
    }

    // ================= BGM KHUSUS MENU =================
    public void playMenuBgm() {
        String menuFile = "bgm_menu.wav";
        // Jika BGM menu sudah sedang diputar, jangan restart
        if (currentBgm != null && menuFile.equals(currentBgmFile)) {
            return;
        }
        stopCurrentBgm();
        MediaPlayer mp = bgmPlayers.get(menuFile);
        if (mp == null) {
            try {
                Media media = new Media(new File("sounds/" + menuFile).toURI().toString());
                mp = new MediaPlayer(media);
                mp.setCycleCount(MediaPlayer.INDEFINITE);
                mp.setVolume(bgmVolume);
                bgmPlayers.put(menuFile, mp);
            } catch (Exception e) {
                System.err.println("Gagal load BGM menu");
                return;
            }
        }
        mp.play();
        currentBgm = mp;
        currentBgmFile = menuFile;
    }

    // ================= BGM PER MAP =================
    public void playMapBgm(MapType map) {
        String file = map.bgmFile;
        // Jika BGM map yang sama sudah diputar, jangan restart
        if (currentBgm != null && file.equals(currentBgmFile)) {
            return;
        }
        stopCurrentBgm();
        MediaPlayer mp = bgmPlayers.get(file);
        if (mp == null) {
            try {
                Media media = new Media(new File("sounds/" + file).toURI().toString());
                mp = new MediaPlayer(media);
                mp.setCycleCount(MediaPlayer.INDEFINITE);
                mp.setVolume(bgmVolume);
                bgmPlayers.put(file, mp);
            } catch (Exception e) {
                System.err.println("Gagal load BGM " + file);
                return;
            }
        }
        mp.play();
        currentBgm = mp;
        currentBgmFile = file;
    }

    public void playGameBgm() {
        playMapBgm(MapType.DARK);
    }

    public void stopCurrentBgm() {
        if (currentBgm != null) {
            currentBgm.stop();
            currentBgm = null;
            currentBgmFile = null;
        }
    }

    public void pauseBgm() {
        if (currentBgm != null) currentBgm.pause();
    }

    public void resumeBgm() {
        if (currentBgm != null) currentBgm.play();
    }

    // ================= SFX =================
    public void playEatSound() { if (eatSound != null) eatSound.play(); }
    public void playHealSound() { if (healSound != null) healSound.play(); }
    public void playDamageSound() { if (damageSound != null) damageSound.play(); }
    public void playAbilitySound() { if (abilitySound != null) abilitySound.play(); }
    public void playGameOverSound() { stopCurrentBgm(); if (gameOverSound != null) gameOverSound.play(); }

    /** Hentikan AudioClip game over (berjalan terpisah dari BGM MediaPlayer). */
    public void stopGameOverSound() {
        if (gameOverSound != null) gameOverSound.stop();
    }

    /** Hentikan SEMUA suara: BGM MediaPlayer + AudioClip game over. */
    public void stopAllSounds() {
        stopCurrentBgm();
        stopGameOverSound();
    }
}