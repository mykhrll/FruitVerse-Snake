import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.stage.Stage;

public class LoginPane extends VBox {
    private Stage stage;
    private static String playerName = null;

    public LoginPane(Stage stage) {
        this.stage = stage;
        setupUI();
    }

    private void setupUI() {
        setAlignment(Pos.CENTER);
        setSpacing(20);
        setStyle("-fx-background-color: #1a1a2e;");

        Text title = new Text("FruitVerse Snake");
        title.setFont(Font.font(48));
        title.setFill(Color.GOLD);

        Text prompt = new Text("Masukkan nama Anda:");
        prompt.setFont(Font.font(20));
        prompt.setFill(Color.WHITE);

        TextField nameField = new TextField();
        nameField.setMaxWidth(300);
        nameField.setStyle("-fx-font-size: 16px; -fx-padding: 8px;");

        Button startBtn = new Button("Mulai");
        startBtn.setStyle("-fx-font-size: 18px; -fx-padding: 10px 30px; -fx-background-color: #0f3460; -fx-text-fill: white;");
        startBtn.setOnAction(e -> {
            String name = nameField.getText().trim();
            if (name.isEmpty()) name = "Pemain";
            playerName = name;
            goToMenu();
        });

        getChildren().addAll(title, prompt, nameField, startBtn);
    }

    private void goToMenu() {
        MenuPane menu = new MenuPane(stage);
        Scene scene = new Scene(menu, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setScene(scene);
        stage.setMaximized(true);
    }

    public static String getPlayerName() {
        return playerName;
    }
}