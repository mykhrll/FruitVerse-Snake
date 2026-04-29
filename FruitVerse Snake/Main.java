import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main extends Application {
    @Override
    public void start(Stage stage) {
        LoginPane login = new LoginPane(stage);
        Scene scene = new Scene(login, ScreenUtil.getWidth(), ScreenUtil.getHeight());
        stage.setTitle("FruitVerse Snake");
        stage.setScene(scene);
        stage.setMaximized(true);
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}