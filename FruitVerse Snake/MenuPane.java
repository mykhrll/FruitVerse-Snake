import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.paint.CycleMethod;
import javafx.scene.paint.LinearGradient;
import javafx.scene.paint.Stop;
import javafx.scene.shape.Circle;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import javafx.stage.Modality;

public class MenuPane extends VBox {
    private Stage stage;
    private static int coins = 500;
    private static SoundManager sharedSound = null;
    private LeaderboardManager leaderboard = new LeaderboardManager();
    private static boolean firstTime = true;

    public MenuPane(Stage stage) {
        this.stage = stage;
        if (sharedSound == null) sharedSound = new SoundManager();
        setupUI();
    }

    private void setupUI() {
        setAlignment(Pos.CENTER);
        setSpacing(30);
        LinearGradient gradient = new LinearGradient(0, 0, 1, 1, true, CycleMethod.NO_CYCLE,
            new Stop(0, Color.web("#0a0a2a")),
            new Stop(0.5, Color.web("#1a1a4e")),
            new Stop(1, Color.web("#2a2a6e")));
        setBackground(new Background(new BackgroundFill(gradient, CornerRadii.EMPTY, null)));

        Text title = new Text("FruitVerse Snake");
        title.setFont(Font.font("Arial", FontWeight.BOLD, 56));
        title.setFill(Color.GOLD);
        DropShadow dropShadow = new DropShadow();
        dropShadow.setRadius(8);
        dropShadow.setOffsetX(3);
        dropShadow.setOffsetY(3);
        dropShadow.setColor(Color.rgb(0,0,0,0.7));
        title.setEffect(dropShadow);

        Text playerText = new Text("Player: " + LoginPane.getPlayerName());
        playerText.setFont(Font.font(20));
        playerText.setFill(Color.LIGHTYELLOW);

        // Coin display dengan gambar koin (bukan emoji)
        HBox coinBox = new HBox(10);
        coinBox.setAlignment(Pos.CENTER);
        Circle coinIcon = new Circle(12, Color.GOLD);
        coinIcon.setStroke(Color.ORANGE);
        coinIcon.setStrokeWidth(1.5);
        Text coinText = new Text("Coins: " + coins);
        coinText.setFont(Font.font(24));
        coinText.setFill(Color.GOLD);
        coinBox.getChildren().addAll(coinIcon, coinText);

        Button playBtn = createStyledButton("PLAY", "#2ecc71");
        Button shopBtn = createStyledButton("SHOP", "#3498db");
        Button howBtn = createStyledButton("HOW TO PLAY", "#f1c40f");
        Button leaderBtn = createStyledButton("LEADERBOARD", "#f39c12");
        Button exitBtn = createStyledButton("EXIT", "#e74c3c");

        playBtn.setOnAction(e -> startGame());
        shopBtn.setOnAction(e -> openShop());
        howBtn.setOnAction(e -> showHowToPlay());
        leaderBtn.setOnAction(e -> showLeaderboard());
        exitBtn.setOnAction(e -> stage.close());

        getChildren().addAll(title, playerText, coinBox, playBtn, shopBtn, howBtn, leaderBtn, exitBtn);

        sharedSound.playMenuBgm();

        // Tampilkan popup tutorial pertama kali
        if (firstTime) {
            firstTime = false;
            showTutorialPopup();
        }
    }

    private Button createStyledButton(String text, String color) {
        Button btn = new Button(text);
        btn.setFont(Font.font(18));
        btn.setStyle("-fx-background-color: " + color + "; -fx-text-fill: white; -fx-padding: 12 30; -fx-background-radius: 30;");
        btn.setOnMouseEntered(e -> btn.setStyle("-fx-background-color: " + color + "; -fx-text-fill: yellow; -fx-padding: 12 30; -fx-background-radius: 30; -fx-cursor: hand;"));
        btn.setOnMouseExited(e -> btn.setStyle("-fx-background-color: " + color + "; -fx-text-fill: white; -fx-padding: 12 30; -fx-background-radius: 30;"));
        return btn;
    }

    private void startGame() {
        sharedSound.stopCurrentBgm();
        GamePane gamePane = new GamePane(this, coins, leaderboard);
        Scene gameScene = new Scene(gamePane, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(gameScene);
        stage.setMaximized(true);
        gamePane.startGame(gameScene);
    }

    private void openShop() {
        ShopPane shopPane = new ShopPane(this, coins);
        Scene shopScene = new Scene(shopPane, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(shopScene);
        stage.setMaximized(true);
    }

    private void showHowToPlay() {
        showTutorialPopup();
    }

    private void showTutorialPopup() {
        Stage popupStage = new Stage();
        popupStage.initModality(Modality.APPLICATION_MODAL);
        popupStage.initOwner(stage);
        popupStage.setTitle("Cara Bermain - FruitVerse Snake");

        VBox content = createTutorialContent();

        ScrollPane scroll = new ScrollPane(content);
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: #0a0a2a; -fx-background-color: transparent;");
        scroll.setPrefSize(600, 500);

        Button closeBtn = new Button("TUTUP");
        closeBtn.setStyle("-fx-font-size: 16px; -fx-padding: 8 20; -fx-background-color: #e67e22; -fx-text-fill: white; -fx-background-radius: 30;");
        closeBtn.setOnAction(e -> popupStage.close());

        VBox root = new VBox(10);
        root.setStyle("-fx-background-color: #0a0a2a; -fx-padding: 10;");
        root.getChildren().addAll(scroll, closeBtn);
        root.setAlignment(Pos.CENTER);

        Scene scene = new Scene(root, 620, 550);
        popupStage.setScene(scene);
        popupStage.showAndWait();
    }

    private VBox createTutorialContent() {
        VBox content = new VBox(15);
        content.setAlignment(Pos.TOP_CENTER);
        content.setStyle("-fx-padding: 20; -fx-background-color: #0a0a2a;");

        Label title = new Label("CARA BERMAIN");
        title.setFont(Font.font("Arial", FontWeight.BOLD, 28));
        title.setTextFill(Color.GOLD);

        Label controls = new Label(
            "KONTROL:\n" +
            "  W / Arrow Up   : Gerak ke atas\n" +
            "  S / Arrow Down : Gerak ke bawah\n" +
            "  A / Arrow Left : Gerak ke kiri\n" +
            "  D / Arrow Right: Gerak ke kanan\n" +
            "  1 : Ability Slow Motion (50 koin)\n" +
            "  2 : Ability Speed Up (50 koin)\n" +
            "  3 : Ability Magnet (50 koin)\n" +
            "  4 : Ability Ghost / Tembus (50 koin)\n" +
            "  SPACE / ESC / P : Jeda (Pause)"
        );
        controls.setFont(Font.font(14));
        controls.setTextFill(Color.WHITE);
        controls.setStyle("-fx-padding: 10; -fx-background-color: #1a1a4e; -fx-background-radius: 10;");

        Label items = new Label(
            "MAKANAN & ITEM (berganti tema tiap map):\n" +
            "  - Makanan biasa : +10 skor, +5 koin\n" +
            "  - Bintang       : +30 skor, +5 koin\n" +
            "  - Ramuan Hijau  : +20 HP\n" +
            "  - Racun         : -10 HP\n" +
            "  - Buah Pelangi  : Ganti map (muncul tiap 60 detik)"
        );
        items.setFont(Font.font(13));
        items.setTextFill(Color.LIGHTYELLOW);
        items.setStyle("-fx-padding: 10; -fx-background-color: #1a1a4e; -fx-background-radius: 10;");

        Label maps = new Label(
            "MAP & MAKANAN KHAS:\n" +
            "  - Dark Map        : Dark Berry\n" +
            "  - Forest Map      : Mushroom\n" +
            "  - Desert Map      : Cactus Fruit\n" +
            "  - Snow Map        : Ice Berry\n" +
            "  - Neon Map        : Neon Apple"
        );
        maps.setFont(Font.font(13));
        maps.setTextFill(Color.LIGHTGREEN);
        maps.setStyle("-fx-padding: 10; -fx-background-color: #1a1a4e; -fx-background-radius: 10;");

        content.getChildren().addAll(title, controls, items, maps);
        return content;
    }

    private void showLeaderboard() {
        VBox leaderPane = new VBox(20);
        leaderPane.setAlignment(Pos.CENTER);
        leaderPane.setStyle("-fx-background-color: #1a1a2e;");
        Text title = new Text("LEADERBOARD");
        title.setFont(Font.font(36));
        title.setFill(Color.GOLD);
        VBox listBox = new VBox(8);
        listBox.setAlignment(Pos.CENTER);
        for (LeaderboardEntry e : leaderboard.getTop10()) {
            Text entry = new Text(e.name + "  :  " + e.score);
            entry.setFill(Color.WHITE);
            entry.setFont(Font.font(18));
            listBox.getChildren().add(entry);
        }
        Button backBtn = new Button("BACK TO MENU");
        backBtn.setStyle("-fx-font-size: 16px; -fx-padding: 10px 20px; -fx-background-color: #e67e22; -fx-text-fill: white; -fx-background-radius: 20;");
        backBtn.setOnAction(ev -> backToMenu());
        leaderPane.getChildren().addAll(title, listBox, backBtn);
        Scene scene = new Scene(leaderPane, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(scene);
        stage.setMaximized(true);
    }

    private void backToMenu() {
        MenuPane menu = new MenuPane(stage);
        Scene scene = new Scene(menu, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(scene);
        stage.setMaximized(true);
    }

    public void updateCoins(int newCoins, Text coinText) {
        coins = newCoins;
    }

    public int getCoins() { return coins; }
    public SoundManager getSound() { return sharedSound; }
}