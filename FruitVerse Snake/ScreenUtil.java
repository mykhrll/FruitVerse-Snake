import javafx.geometry.Rectangle2D;
import javafx.stage.Screen;

public class ScreenUtil {
    private static double width = -1, height = -1;
    public static double getWidth() {
        if (width < 0) init();
        return width;
    }
    public static double getHeight() {
        if (height < 0) init();
        return height;
    }
    private static void init() {
        Rectangle2D b = Screen.getPrimary().getVisualBounds();
        width = b.getWidth();
        height = b.getHeight();
    }
}