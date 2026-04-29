import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.effect.DropShadow;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import javafx.util.Duration;
import java.util.Random;

public class GamePane extends Pane {
    private static final int GRID_COLS = 32;
    private static final int GRID_ROWS = 24;
    private static final int GAME_SPEED_MS = 150;

    // FIX: HUD_W dihitung dinamis agar canvas mengisi penuh layar
    private double HUD_W;
    private int cellSize;
    private double gameW, gameH, totalW, totalH;

    private GameManager gm;
    private Timeline loop;
    private Timeline secondTimer;
    private Canvas canvas;
    private GraphicsContext gc;
    private MenuPane menuPane;

    private boolean abilityActive = false;
    private String abilityType = "";
    private int abilityDuration = 0;
    private boolean paused = false;

    private VBox pauseOverlay;
    private Button pauseBtn;       // tombol pause di pojok kanan atas
    private HBox gameOverPanel;

    private Random rand = new Random();
    private double[] starX, starY;
    private double[] treeX, treeY;
    private double[] snowX, snowY;
    private double[] neonDotsX, neonDotsY;

    public GamePane(MenuPane menuPane, int coins, LeaderboardManager leaderboard) {
        this.menuPane = menuPane;
        this.gm = new GameManager(coins, menuPane.getSound(), leaderboard);
        setupCanvas();
        initDecorations();
        createPauseOverlay();
        createPauseButton();   // hanya tombol pause di pojok atas
        setStyle("-fx-background-color: black;");

        // listen ke ukuran nyata pane untuk kalkulasi fullscreen
        widthProperty().addListener((obs, old, v) -> adjustCanvasSize());
        heightProperty().addListener((obs, old, v) -> adjustCanvasSize());
    }

    // -------------------------------------------------------------
    //  INISIALISASI
    // -------------------------------------------------------------
    private void initDecorations() {
        starX = new double[120]; starY = new double[120];
        for (int i = 0; i < 120; i++) { starX[i] = rand.nextDouble(); starY[i] = rand.nextDouble(); }
        treeX = new double[15]; treeY = new double[15];
        for (int i = 0; i < 15; i++) { treeX[i] = rand.nextDouble(); treeY[i] = rand.nextDouble(); }
        snowX = new double[80]; snowY = new double[80];
        for (int i = 0; i < 80; i++) { snowX[i] = rand.nextDouble(); snowY[i] = rand.nextDouble(); }
        neonDotsX = new double[200]; neonDotsY = new double[200];
        for (int i = 0; i < 200; i++) { neonDotsX[i] = rand.nextDouble(); neonDotsY[i] = rand.nextDouble(); }
    }

    private void setupCanvas() {
        canvas = new Canvas();
        gc = canvas.getGraphicsContext2D();
        getChildren().add(canvas);
    }

    // -------------------------------------------------------------
    //  KALKULASI UKURAN LAYAR PENUH
    // -------------------------------------------------------------
    private void adjustCanvasSize() {
        double sw = getWidth();
        double sh = getHeight();
        if (sw <= 0 || sh <= 0) return;

        // cellSize berbasis tinggi layar sehingga tidak ada ruang kosong di bawah
        cellSize = (int)(sh / GRID_ROWS);
        cellSize = Math.max(cellSize, 18);

        gameW  = cellSize * GRID_COLS;
        gameH  = cellSize * GRID_ROWS;

        // HUD mengisi sisa lebar layar yang tersedia
        HUD_W  = Math.max(200, sw - gameW);
        totalW = gameW + HUD_W;
        totalH = sh;   // canvas setinggi layar penuh

        canvas.setWidth(totalW);
        canvas.setHeight(totalH);
        canvas.setLayoutX(0);
        canvas.setLayoutY(0);

        // Posisikan tombol pause di pojok kanan atas
        if (pauseBtn != null) {
            pauseBtn.setLayoutX(gameW + HUD_W - 55);
            pauseBtn.setLayoutY(8);
        }
        // Posisikan overlay pause di tengah area game
        if (pauseOverlay != null) {
            pauseOverlay.setLayoutX((gameW - 300) / 2);
            pauseOverlay.setLayoutY((gameH - 220) / 2);
        }
        if (gameOverPanel != null && gameOverPanel.isVisible()) {
            gameOverPanel.setLayoutX((gameW - 220) / 2);
            gameOverPanel.setLayoutY(gameH / 2 + 80);
        }
        if (gm != null && !gm.isGameOver()) draw();
    }

    // -------------------------------------------------------------
    //  TOMBOL PAUSE (pojok kanan atas area HUD)
    // -------------------------------------------------------------
    private void createPauseButton() {
        pauseBtn = new Button("||");
        pauseBtn.setFont(Font.font("Arial", FontWeight.BOLD, 14));
        pauseBtn.setStyle(
            "-fx-background-color: rgba(255,200,0,0.85);" +
            "-fx-text-fill: #1a1a2e;" +
            "-fx-background-radius: 20;" +
            "-fx-min-width: 44; -fx-min-height: 30;" +
            "-fx-cursor: hand;"
        );
        pauseBtn.setEffect(new DropShadow(4, Color.BLACK));
        pauseBtn.setOnAction(e -> togglePause());
        getChildren().add(pauseBtn);
    }

    private void createPauseOverlay() {
        pauseOverlay = new VBox(18);
        pauseOverlay.setAlignment(Pos.CENTER);
        pauseOverlay.setStyle(
            "-fx-background-color: rgba(0,0,0,0.88);" +
            "-fx-border-color: #ffcc00; -fx-border-width: 3;" +
            "-fx-border-radius: 20; -fx-background-radius: 20;" +
            "-fx-padding: 30;"
        );
        pauseOverlay.setPrefWidth(300);
        pauseOverlay.setVisible(false);

        Label lbl = new Label("PAUSED");
        lbl.setFont(Font.font("Arial", FontWeight.BOLD, 36));
        lbl.setTextFill(Color.GOLD);

        Button resumeBtn = new Button("RESUME  (SPACE / P)");
        Button quitBtn   = new Button("QUIT TO MENU");
        resumeBtn.setStyle("-fx-font-size: 16px; -fx-padding: 8 20; -fx-background-color: #2ecc71; -fx-text-fill: white; -fx-background-radius: 30;");
        quitBtn.setStyle  ("-fx-font-size: 16px; -fx-padding: 8 20; -fx-background-color: #e74c3c; -fx-text-fill: white; -fx-background-radius: 30;");

        resumeBtn.setOnAction(e -> togglePause());
        quitBtn.setOnAction(e -> {
            // Hentikan BGM sebelum kembali ke menu
            gm.getSoundManager().stopCurrentBgm();
            backToMenu();
        });

        pauseOverlay.getChildren().addAll(lbl, resumeBtn, quitBtn);
        getChildren().add(pauseOverlay);
    }

    // -------------------------------------------------------------
    //  START GAME
    // -------------------------------------------------------------
    public void startGame(Scene scene) {
        // Arrow keys sekarang berfungsi (tidak ada tombol UI yang mencuri fokus)
        // Gunakan addEventFilter (fase capture) agar arrow key dan Enter tidak
        // dikonsumsi lebih dulu oleh fokus tombol-tombol UI di layar.
        scene.addEventFilter(KeyEvent.KEY_PRESSED, e -> {
            e.consume(); // cegah tombol UI memproses event keyboard
            KeyCode code = e.getCode();
            if (gm.isGameOver()) {
                if (code == KeyCode.ENTER) {
                    backToMenu();
                }
                return;
            }
            if (code == KeyCode.SPACE || code == KeyCode.ESCAPE || code == KeyCode.P) {
                togglePause();
                return;
            }
            if (paused) return;
            switch (code) {
                case W: case UP:    gm.getSnake().setDirection(0, -1); break;
                case S: case DOWN:  gm.getSnake().setDirection(0,  1); break;
                case A: case LEFT:  gm.getSnake().setDirection(-1, 0); break;
                case D: case RIGHT: gm.getSnake().setDirection( 1, 0); break;
                case DIGIT1: activateAbility("slow");   break;
                case DIGIT2: activateAbility("speed");  break;
                case DIGIT3: activateAbility("magnet"); break;
                case DIGIT4: activateAbility("ghost");  break;
                default: break;
            }
        });

        loop = new Timeline(new KeyFrame(Duration.millis(GAME_SPEED_MS), e -> {
            if (!paused && !gm.isGameOver()) {
                gm.update(abilityActive, abilityType);
                draw();
                if (gm.isGameOver()) {
                    loop.stop();
                    secondTimer.stop();
                    showGameOver();
                }
            }
        }));
        loop.setCycleCount(Timeline.INDEFINITE);

        secondTimer = new Timeline(new KeyFrame(Duration.seconds(1), e -> {
            if (!paused && !gm.isGameOver()) gm.updateMapChangerTimer();
        }));
        secondTimer.setCycleCount(Timeline.INDEFINITE);

        adjustCanvasSize();
        loop.play();
        secondTimer.play();
        gm.getSoundManager().playGameBgm();
    }

    // -------------------------------------------------------------
    //  PAUSE
    // -------------------------------------------------------------
    private void togglePause() {
        if (gm.isGameOver()) return;
        paused = !paused;
        if (paused) {
            loop.pause();
            secondTimer.pause();
            gm.getSoundManager().pauseBgm();
            pauseOverlay.setVisible(true);
            pauseOverlay.setLayoutX((gameW - 300) / 2);
            pauseOverlay.setLayoutY((gameH - 220) / 2);
            pauseBtn.setText("▶");
        } else {
            loop.play();
            secondTimer.play();
            gm.getSoundManager().resumeBgm();
            pauseOverlay.setVisible(false);
            pauseBtn.setText("||");
        }
    }

    // -------------------------------------------------------------
    //  ABILITY
    // -------------------------------------------------------------
    private void activateAbility(String type) {
        if (gm.getSnake().getCoins() < 50) return;
        gm.getSnake().addCoins(-50);
        gm.playAbilitySound();
        if (abilityActive) {
            resetAbilityEffect();
            abilityType = type;
            abilityDuration += 150;
            if (abilityDuration > 600) abilityDuration = 600;
        } else {
            abilityActive = true;
            abilityType = type;
            abilityDuration = 300;
        }
        applyAbilityEffect(type);
    }

    private void applyAbilityEffect(String type) {
        switch (type) {
            case "slow":   loop.setRate(0.5); gm.setGhostMode(false); break;
            case "speed":  loop.setRate(2.0); gm.setGhostMode(false); break;
            case "ghost":  loop.setRate(1.0); gm.setGhostMode(true);  break;
            case "magnet": loop.setRate(1.0); gm.setGhostMode(false); break;
        }
    }

    private void resetAbilityEffect() {
        loop.setRate(1.0);
        gm.setGhostMode(false);
    }

    // -------------------------------------------------------------
    //  DRAW
    // -------------------------------------------------------------
    private void draw() {
        if (cellSize <= 0) return;
        drawMap();
        drawItems();
        drawSnake();
        drawHUD();
        if (abilityActive) {
            drawAbilityBar();
            abilityDuration--;
            if (abilityDuration <= 0) {
                abilityActive = false;
                resetAbilityEffect();
            }
        }
    }

    private void drawMap() {
        MapType map = gm.getCurrentMap();
        // gambar map sampai penuh tinggi canvas (totalH = screen height)
        gc.setFill(Color.web(map.bgColor));
        gc.fillRect(0, 0, gameW, totalH);

        switch (map) {
            case DARK:
                gc.setFill(Color.rgb(255, 255, 200, 0.3));
                for (int i = 0; i < starX.length; i++)
                    gc.fillOval(starX[i] * gameW, starY[i] * totalH, 1.5, 1.5);
                break;
            case FOREST:
                gc.setFill(Color.rgb(50, 100, 30, 0.55));
                for (int i = 0; i < treeX.length; i++) {
                    double tx = treeX[i] * gameW, ty = treeY[i] * totalH;
                    gc.fillOval(tx - 5, ty - 10, 10, 15);
                    gc.fillRect(tx - 1.5, ty - 5, 3, 12);
                }
                break;
            case DESERT:
                gc.setFill(Color.rgb(210, 180, 100, 0.45));
                for (int i = 0; i < 18; i++) {
                    double bx = (i * 71.3) % gameW;
                    double by = totalH * 0.6 + (i * 37.1) % (totalH * 0.4);
                    gc.fillOval(bx - 12, by - 6, 24, 12);
                }
                break;
            case SNOW:
                gc.setFill(Color.rgb(255, 255, 255, 0.7));
                for (int i = 0; i < snowX.length; i++)
                    gc.fillOval(snowX[i] * gameW, snowY[i] * totalH, 2.5, 2.5);
                break;
            case NEON:
                for (int i = 0; i < neonDotsX.length; i++) {
                    gc.setFill(Color.hsb((i * 7.3) % 360, 1, 1, 0.35));
                    gc.fillOval(neonDotsX[i] * gameW, neonDotsY[i] * totalH, 2, 2);
                }
                break;
        }

        // Grid tipis
        gc.setStroke(Color.rgb(255, 255, 255, 0.12));
        gc.setLineWidth(0.5);
        for (int i = 0; i <= GRID_COLS; i++) gc.strokeLine(i * cellSize, 0, i * cellSize, gameH);
        for (int j = 0; j <= GRID_ROWS; j++) gc.strokeLine(0, j * cellSize, gameW, j * cellSize);
    }

    private void drawItems() {
        for (Item item : gm.getItems()) item.drawOnCanvas(gc, cellSize);
    }

    private void drawSnake() {
        String skin = ShopPane.getSelectedSkin();
        var body = gm.getSnake().getBody();
        for (int i = 1; i < body.size(); i++) {
            int[] p = body.get(i);
            gc.setFill(getSnakeColor(skin, i, body.size()));
            gc.fillRoundRect(p[0]*cellSize+1, p[1]*cellSize+1, cellSize-2, cellSize-2, cellSize/2.0, cellSize/2.0);
        }
        int[] head = body.getFirst();
        gc.setFill(getSnakeColor(skin, 0, body.size()));
        gc.fillRoundRect(head[0]*cellSize, head[1]*cellSize, cellSize, cellSize, cellSize/2.0, cellSize/2.0);
        drawSnakeHead(head);
    }

    private Color getSnakeColor(String skin, int idx, int size) {
        double f = 1.0 - (idx * 0.55 / Math.max(size, 1));
        switch (skin) {
            case "green":   return Color.rgb(0,    (int)(200*f+55), 0);
            case "gold":    return Color.rgb(255,  (int)(180*f+55), 0);
            case "red":     return Color.rgb((int)(220*f+35), 0, 0);
            case "blue":    return Color.rgb(0,    (int)(100*f+20), (int)(220*f+35));
            case "rainbow": return Color.hsb((idx*25.0)%360, 1, 0.9);
            case "purple":  return Color.rgb((int)(150*f+50), 0, (int)(200*f+50));
            case "orange":  return Color.rgb(255,  (int)(100*f+50), 0);
            case "cyan":    return Color.rgb(0,    (int)(200*f+50), (int)(200*f+50));
            case "pink":    return Color.rgb(255,  (int)(100*f+50), (int)(180*f+50));
            case "lime":    return Color.rgb((int)(150*f+50), 255, 0);
            default:        return Color.GREEN;
        }
    }

    private void drawSnakeHead(int[] head) {
        double hx = head[0]*cellSize, hy = head[1]*cellSize;
        double es = Math.max(4, cellSize*0.20);
        gc.setFill(Color.WHITE);
        gc.fillOval(hx+cellSize*0.18, hy+cellSize*0.18, es, es);
        gc.fillOval(hx+cellSize*0.56, hy+cellSize*0.18, es, es);
        gc.setFill(Color.BLACK);
        gc.fillOval(hx+cellSize*0.21, hy+cellSize*0.21, es*0.6, es*0.6);
        gc.fillOval(hx+cellSize*0.59, hy+cellSize*0.21, es*0.6, es*0.6);
        gc.setStroke(Color.RED);
        gc.setLineWidth(2);
        double tx = hx+cellSize*0.5, ty = hy+cellSize*0.75;
        gc.strokeLine(tx, ty, tx, ty+cellSize*0.2);
        gc.strokeLine(tx, ty+cellSize*0.2, tx-cellSize*0.12, ty+cellSize*0.35);
        gc.strokeLine(tx, ty+cellSize*0.2, tx+cellSize*0.12, ty+cellSize*0.35);
        if (abilityActive && "ghost".equals(abilityType)) {
            gc.setStroke(Color.CYAN); gc.setLineWidth(2);
            gc.strokeRoundRect(hx, hy, cellSize, cellSize, cellSize/2.0, cellSize/2.0);
        }
    }

    // -------------------------------------------------------------
    //  HUD — proporsional dengan sisa lebar layar
    // -------------------------------------------------------------
    private void drawHUD() {
        double hx = gameW;
        double hh = totalH;  // HUD setinggi layar penuh

        // Background HUD
        gc.setFill(Color.rgb(10, 8, 30, 0.92));
        gc.fillRect(hx, 0, HUD_W, hh);
        gc.setStroke(Color.rgb(255, 215, 0, 0.55));
        gc.setLineWidth(1.5);
        gc.strokeLine(hx, 0, hx, hh);

        double lx = hx + 16;     // left margin dalam HUD
        double maxTxtW = HUD_W - 32; // lebar teks maksimum

        // Judul
        gc.setFill(Color.GOLD);
        gc.setFont(Font.font("Arial", FontWeight.BOLD, Math.min(22, HUD_W * 0.09)));
        gc.fillText("FRUITVERSE", lx, 38);

        double y = 70;
        double lineH = Math.min(32, hh / 20.0);  // jarak antar baris adaptif
        double fSmall = Math.min(14, HUD_W * 0.056);
        double fMed   = Math.min(16, HUD_W * 0.064);

        gc.setFont(Font.font("Arial", fSmall));
        gc.setFill(Color.web("#aaccff"));
        gc.fillText("Player: " + LoginPane.getPlayerName(), lx, y); y += lineH;

        gc.setFill(Color.WHITE);
        gc.setFont(Font.font("Arial", FontWeight.BOLD, fMed));
        gc.fillText("Score : " + gm.getScore(), lx, y); y += lineH;
        gc.fillText("Coins : " + gm.getSnake().getCoins(), lx, y); y += lineH;

        // HP bar
        int hp = gm.getSnake().getHealth();
        Color hpCol = hp > 70 ? Color.LIMEGREEN : hp > 30 ? Color.ORANGE : Color.RED;
        gc.setFont(Font.font("Arial", fSmall));
        gc.setFill(Color.web("#aaccff"));
        gc.fillText("HP: " + hp + "/100", lx, y); y += 5;
        double barW = HUD_W - 32;
        drawBar(gc, lx, y, barW, 11, hp/100.0, hpCol, Color.web("#330000"));
        y += lineH;

        // Map
        gc.setFill(Color.LIGHTCYAN);
        gc.setFont(Font.font("Arial", FontWeight.BOLD, fSmall));
        gc.fillText("MAP: " + gm.getCurrentMap().name(), lx, y); y += lineH;

        // Tema makanan
        gc.setFill(Color.web("#ffffaa"));
        gc.setFont(Font.font("Arial", fSmall));
        gc.fillText("Food: " + getFoodName(gm.getCurrentMap()), lx, y); y += lineH - 4;
        gc.fillText("       +10 skor, +5 koin", lx, y); y += lineH;

        // Separator
        gc.setStroke(Color.rgb(255,215,0,0.3)); gc.setLineWidth(1);
        gc.strokeLine(lx, y, hx + HUD_W - 16, y); y += lineH * 0.6;

        // Abilities
        gc.setFill(Color.CYAN);
        gc.setFont(Font.font("Arial", FontWeight.BOLD, fSmall));
        gc.fillText("ABILITIES  (50 koin)", lx, y); y += lineH - 6;

        String[][] abs = {{"[1]","Slow"},{"[2]","Speed"},{"[3]","Magnet"},{"[4]","Ghost"}};
        gc.setFont(Font.font("Arial", Math.min(12, HUD_W*0.048)));
        for (String[] ab : abs) {
            gc.setFill(Color.web("#6699ff")); gc.fillText(ab[0], lx, y);
            gc.setFill(Color.WHITE);          gc.fillText(ab[1], lx+36, y);
            y += lineH - 8;
        }

        if (abilityActive) {
            y += 4;
            gc.setFill(Color.YELLOW);
            gc.setFont(Font.font("Arial", FontWeight.BOLD, fSmall));
            gc.fillText("AKTIF: " + abilityType.toUpperCase() +
                    " (" + (abilityDuration/60+1) + "s)", lx, y);
            y += lineH;
        }

        // Separator
        y += 4;
        gc.setStroke(Color.rgb(255,215,0,0.3)); gc.setLineWidth(1);
        gc.strokeLine(lx, y, hx + HUD_W - 16, y); y += lineH * 0.6;

        // Kontrol
        gc.setFill(Color.web("#aabbcc"));
        gc.setFont(Font.font("Arial", FontWeight.BOLD, fSmall));
        gc.fillText("KONTROL", lx, y); y += lineH - 4;
        gc.setFont(Font.font("Arial", Math.min(12, HUD_W*0.048)));
        gc.setFill(Color.WHITE);
        String[] ctrlLines = {"WASD / Panah : Gerak",
                              "1-4          : Ability",
                              "SPACE/ESC/P  : Pause",
                              "ENTER        : Ke Menu"};
        for (String cl : ctrlLines) {
            if (y < hh - 20) { gc.fillText(cl, lx, y); y += lineH - 8; }
        }

        // Buah Map Changer info (di bagian bawah HUD jika masih ada ruang)
        y += 6;
        if (y < hh - 40) {
            gc.setStroke(Color.rgb(255,215,0,0.3)); gc.strokeLine(lx, y, hx+HUD_W-16, y); y += lineH*0.6;
            gc.setFill(Color.MAGENTA);
            gc.setFont(Font.font("Arial", Math.min(12, HUD_W*0.048)));
            gc.fillText("Makan Buah Pelangi", lx, y); y += lineH - 8;
            gc.fillText("  → Ganti Map + BGM!", lx, y);
        }
    }

    private void drawBar(GraphicsContext gc, double x, double y, double w, double h,
                          double ratio, Color fill, Color bg) {
        gc.setFill(bg);  gc.fillRoundRect(x, y, w, h, h, h);
        if (ratio > 0) { gc.setFill(fill); gc.fillRoundRect(x, y, w * Math.min(1, ratio), h, h, h); }
    }

    private void drawAbilityBar() {
        double ratio = Math.min(1.0, abilityDuration / 600.0);
        gc.setFill(Color.rgb(255, 220, 0, 0.75));
        gc.fillRect(0, 0, gameW * ratio, 5);
        gc.setFill(Color.BLACK);
        gc.setFont(Font.font("Arial", FontWeight.BOLD, 13));
        gc.fillText("ABILITY: " + abilityType.toUpperCase() +
                "  (" + (abilityDuration/60+1) + "s)", 10, 20);
    }

    private String getFoodName(MapType map) {
        switch (map) {
            case DARK:   return "Dark Berry";
            case FOREST: return "Mushroom";
            case DESERT: return "Cactus Fruit";
            case SNOW:   return "Ice Berry";
            case NEON:   return "Neon Apple";
            default:     return "Apple";
        }
    }

    // -------------------------------------------------------------
    //  GAME OVER
    // -------------------------------------------------------------
    private void showGameOver() {
        // stop semua BGM saat game over
        gm.getSoundManager().stopCurrentBgm();

        double ox = gameW / 2;
        double oy = gameH / 2;
        gc.setFill(Color.rgb(0,0,0,0.85));
        gc.fillRect(0, 0, gameW, gameH);

        gc.setFill(Color.CRIMSON);
        gc.setFont(Font.font("Arial", FontWeight.BOLD, Math.min(52, cellSize * 2.2)));
        String goText = "GAME OVER";
        double tw = goText.length() * cellSize * 0.9;
        gc.fillText(goText, ox - tw/2, oy - 30);

        gc.setFill(Color.WHITE);
        gc.setFont(Font.font("Arial", 24));
        gc.fillText("Score: " + gm.getScore(), ox - 60, oy + 20);
        gc.setFill(Color.web("#aabbcc"));
        gc.setFont(Font.font("Arial", 15));
        gc.fillText("Tekan ENTER untuk kembali ke menu", ox - 130, oy + 55);

        if (gameOverPanel == null) {
            gameOverPanel = new HBox(12);
            gameOverPanel.setAlignment(Pos.CENTER);

            Button backBtn = new Button("BACK TO MENU");
            backBtn.setStyle("-fx-font-size:17px; -fx-padding:10 22; -fx-background-color:#e67e22; -fx-text-fill:white; -fx-background-radius:30;");
            backBtn.setOnAction(e -> {
                backToMenu(); // stopAllSounds sudah dipanggil di backToMenu()
            });

            gameOverPanel.getChildren().add(backBtn);
            getChildren().add(gameOverPanel);
        }
        gameOverPanel.setLayoutX((gameW - 180) / 2);
        gameOverPanel.setLayoutY(oy + 75);
        gameOverPanel.setVisible(true);
    }

    // -------------------------------------------------------------
    //  KEMBALI KE MENU
    // -------------------------------------------------------------
    private void backToMenu() {
        gm.getSoundManager().stopAllSounds(); // hentikan semua suara termasuk gameover AudioClip
        Stage stage = (Stage) getScene().getWindow();
        menuPane.updateCoins(gm.getSnake().getCoins(), null);
        MenuPane newMenu = new MenuPane(stage);
        Scene scene = new Scene(newMenu, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(scene);
        stage.setMaximized(true);
    }
}