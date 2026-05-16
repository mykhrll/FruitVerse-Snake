import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;

public abstract class Item {
    protected int x, y;
    protected String type;
    protected String icon;
    protected MapType currentMap;

    public Item(MapType map) {
        this.x = (int) (Math.random() * 30);
        this.y = (int) (Math.random() * 22);
        this.currentMap = map;
    }

    public abstract void applyEffect(Snake s, GameManager gm);
    public abstract Color getColor();
    public abstract String getIcon();
    public abstract void drawOnCanvas(GraphicsContext gc, int cellSize);

    public int getX() { return x; }
    public int getY() { return y; }
    public void setX(int x) { this.x = x; }
    public void setY(int y) { this.y = y; }
}