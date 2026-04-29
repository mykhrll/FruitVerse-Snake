import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import java.util.HashSet;
import java.util.Set;

public class ShopPane extends VBox {
    private MenuPane menuPane;
    private int coins;
    private Text coinText;

    private static String selectedSkin = "green";
    private static Set<String> ownedSkins = new HashSet<>();
    static {
        ownedSkins.add("green");
    }

    public ShopPane(MenuPane menuPane, int coins) {
        this.menuPane = menuPane;
        this.coins = coins;
        setupUI();
    }

    private void setupUI() {
        setAlignment(Pos.TOP_CENTER);
        setSpacing(15);
        setStyle("-fx-background-color: #1a1a2e;");
        setPadding(new Insets(20));

        Text title = new Text("Skin Shop");
        title.setFont(Font.font(36));
        title.setFill(Color.GOLD);

        coinText = new Text("Coins: " + coins);
        coinText.setFont(Font.font(20));
        coinText.setFill(Color.WHITE);

        GridPane skinGrid = new GridPane();
        skinGrid.setHgap(20);
        skinGrid.setVgap(20);
        skinGrid.setPadding(new Insets(10));
        skinGrid.setAlignment(Pos.CENTER); // agar grid berada di tengah

        String[][] skins = {
            {"Green", "green", "0"},
            {"Gold", "gold", "200"},
            {"Red", "red", "150"},
            {"Blue", "blue", "150"},
            {"Rainbow", "rainbow", "300"},
            {"Purple", "purple", "250"},
            {"Orange", "orange", "200"},
            {"Cyan", "cyan", "180"},
            {"Pink", "pink", "220"},
            {"Lime", "lime", "280"}
        };

        int col = 0, row = 0;
        for (String[] skin : skins) {
            VBox itemBox = createSkinItem(skin[0], skin[1], Integer.parseInt(skin[2]));
            skinGrid.add(itemBox, col, row);
            col++;
            if (col >= 3) { col = 0; row++; }
        }

        ScrollPane scroll = new ScrollPane(skinGrid);
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: #1a1a2e; -fx-background-color: transparent;");
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER); // hilangkan scroll horizontal
        scroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);

        Button backBtn = new Button("BACK");
        backBtn.setStyle("-fx-font-size: 16px; -fx-padding: 8px 20px; -fx-background-color: #0f3460; -fx-text-fill: white;");
        backBtn.setOnAction(e -> backToMenu());

        getChildren().addAll(title, coinText, scroll, backBtn);
    }

    private VBox createSkinItem(String name, String key, int price) {
        VBox box = new VBox(5);
        box.setAlignment(Pos.CENTER);
        box.setStyle("-fx-padding: 10px; -fx-background-color: #16213e; -fx-border-radius: 10px;");

        Circle preview = new Circle(20);
        switch (key) {
            case "green": preview.setFill(Color.GREEN); break;
            case "gold": preview.setFill(Color.GOLD); break;
            case "red": preview.setFill(Color.RED); break;
            case "blue": preview.setFill(Color.BLUE); break;
            case "rainbow": preview.setFill(Color.PURPLE); break;
            case "purple": preview.setFill(Color.PURPLE); break;
            case "orange": preview.setFill(Color.ORANGE); break;
            case "cyan": preview.setFill(Color.CYAN); break;
            case "pink": preview.setFill(Color.PINK); break;
            case "lime": preview.setFill(Color.LIMEGREEN); break;
        }

        Text nameText = new Text(name);
        nameText.setFill(Color.WHITE);

        Button buyBtn = new Button();
        if (ownedSkins.contains(key)) {
            if (selectedSkin.equals(key)) {
                buyBtn.setText("EQUIPPED");
                buyBtn.setStyle("-fx-background-color: #226622;");
            } else {
                buyBtn.setText("EQUIP");
                buyBtn.setStyle("-fx-background-color: #335599;");
            }
        } else {
            buyBtn.setText(price + " Coins");
            buyBtn.setStyle("-fx-background-color: #e94560;");
        }

        buyBtn.setOnAction(e -> {
            if (ownedSkins.contains(key)) {
                if (!selectedSkin.equals(key)) {
                    selectedSkin = key;
                    refreshShop();
                }
            } else if (coins >= price) {
                coins -= price;
                ownedSkins.add(key);
                selectedSkin = key;
                coinText.setText("Coins: " + coins);
                menuPane.updateCoins(coins, null);
                refreshShop();
            }
        });

        box.getChildren().addAll(preview, nameText, buyBtn);
        return box;
    }

    private void refreshShop() {
        Stage stage = (Stage) getScene().getWindow();
        ShopPane newShop = new ShopPane(menuPane, coins);
        Scene scene = new Scene(newShop, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(scene);
        stage.setMaximized(true);
    }

    private void backToMenu() {
        Stage stage = (Stage) getScene().getWindow();
        MenuPane menu = new MenuPane(stage);
        Scene scene = new Scene(menu, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(scene);
        stage.setMaximized(true);
    }

    public static String getSelectedSkin() { return selectedSkin; }
}