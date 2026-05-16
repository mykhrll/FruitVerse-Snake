import java.util.ArrayList;
import java.util.Random;

public class GameManager {
    private Snake snake;
    private ArrayList<Item> items;
    private SoundManager sound;
    private int score = 0;
    private boolean gameOver = false;
    private boolean ghostMode = false;
    private Random random = new Random();
    private MapType currentMap;
    private LeaderboardManager leaderboard;

    private Item activeMapChanger = null;

    public GameManager(int coins, SoundManager sound, LeaderboardManager leaderboard) {
        this.leaderboard = leaderboard;
        this.sound = sound;
        snake = new Snake(coins);
        items = new ArrayList<>();
        currentMap = MapType.DARK;
        spawnAllItems();
        sound.playMapBgm(currentMap);
    }

    private void spawnAllItems() {
        items.clear();
        activeMapChanger = null;
        // Makanan biasa: 8-12 item
        int foodCount = 8 + random.nextInt(5);
        for (int i = 0; i < foodCount; i++) {
            String type = random.nextBoolean() ? "normal" : "bonus";
            items.add(ItemFactory.createFood(type, currentMap));
        }
        // Poison & Potion masing-masing 1
        items.add(ItemFactory.createPoison(currentMap));
        items.add(ItemFactory.createPotion(currentMap));
        // Map changer akan di-spawn oleh timer
    }

    // Respawn item setelah dimakan (kecuali map changer)
    private void respawnItem(Item consumedItem) {
        if (consumedItem instanceof Food) {
            Food food = (Food) consumedItem;
            if (food.isMapFruit()) {
                // map changer tidak di-respawn otomatis, nanti di-spawn timer
                return;
            }
            // respawn makanan biasa atau bonus
            String type = random.nextBoolean() ? "normal" : "bonus";
            items.add(ItemFactory.createFood(type, currentMap));
        } else if (consumedItem instanceof Potion) {
            items.add(ItemFactory.createPotion(currentMap));
        } else if (consumedItem instanceof Poison) {
            items.add(ItemFactory.createPoison(currentMap));
        }
    }

    public void triggerMapChange() {
        MapType newMap = MapType.next(currentMap);
        currentMap = newMap;
        sound.playMapBgm(currentMap);
        spawnAllItems(); // reset semua item dengan tema baru
        activeMapChanger = null;
    }

    // Timer untuk map changer (dipanggil setiap detik dari GamePane)
    private int mapChangerCooldown = 0;
    public void updateMapChangerTimer() {
        if (gameOver) return;
        if (activeMapChanger != null) return;
        if (mapChangerCooldown > 0) {
            mapChangerCooldown--;
            return;
        }
        activeMapChanger = ItemFactory.createMapChanger(currentMap);
        items.add(activeMapChanger);
        mapChangerCooldown = 60; // cooldown 60 detik setelah spawn
    }

    public void consumeMapChanger() {
        if (activeMapChanger != null) {
            items.remove(activeMapChanger);
            activeMapChanger = null;
            triggerMapChange();
        }
    }

    public void update(boolean abilityActive, String abilityType) {
        if (gameOver) return;
        snake.move();

        if (abilityActive && abilityType.equals("magnet")) {
            for (Item item : items) {
                int dx = item.getX() - snake.getHeadX();
                int dy = item.getY() - snake.getHeadY();
                if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5) {
                    item.setX(item.getX() + (dx > 0 ? -1 : dx < 0 ? 1 : 0));
                    item.setY(item.getY() + (dy > 0 ? -1 : dy < 0 ? 1 : 0));
                }
            }
        }

        checkCollisions();

        if (snake.getHealth() <= 0) {
            gameOver = true;
            leaderboard.addEntry(LoginPane.getPlayerName(), score);
            sound.playGameOverSound();
        }
    }

    private void checkCollisions() {
        for (int i = 0; i < items.size(); i++) {
            Item item = items.get(i);
            if (snake.getHeadX() == item.getX() && snake.getHeadY() == item.getY()) {
                if (item instanceof Food && ((Food)item).isMapFruit()) {
                    consumeMapChanger();
                } else {
                    item.applyEffect(snake, this);
                    respawnItem(item); // SEGERA RESPAWN setelah dimakan
                }
                items.remove(i);
                i--;
            }
        }

        if (!ghostMode) {
            if (snake.getHeadX() < 0 || snake.getHeadX() >= 32 ||
                snake.getHeadY() < 0 || snake.getHeadY() >= 24) {
                snake.takeDamage(10);
                sound.playDamageSound();
                if (snake.getHeadX() < 0) snake.setHeadX(0);
                if (snake.getHeadX() >= 32) snake.setHeadX(31);
                if (snake.getHeadY() < 0) snake.setHeadY(0);
                if (snake.getHeadY() >= 24) snake.setHeadY(23);
            }
        } else {
            if (snake.getHeadX() < 0) snake.setHeadX(31);
            if (snake.getHeadX() >= 32) snake.setHeadX(0);
            if (snake.getHeadY() < 0) snake.setHeadY(23);
            if (snake.getHeadY() >= 24) snake.setHeadY(0);
        }

        if (!ghostMode && snake.checkSelfCollision()) {
            snake.takeDamage(20);
            sound.playDamageSound();
        }
    }

    public void addScore(int val) { score += val; sound.playEatSound(); }
    public void addCoin(int val) { snake.addCoins(val); }
    public void playDamage() { sound.playDamageSound(); }
    public void playAbilitySound() { sound.playAbilitySound(); }
    public void playHeal() { sound.playHealSound(); }

    public Snake getSnake() { return snake; }
    public int getScore() { return score; }
    public boolean isGameOver() { return gameOver; }
    public ArrayList<Item> getItems() { return items; }
    public void setGhostMode(boolean g) { this.ghostMode = g; }
    public SoundManager getSoundManager() { return sound; }
    public MapType getCurrentMap() { return currentMap; }
}