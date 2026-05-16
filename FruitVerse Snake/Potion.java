import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

public class Potion extends Item {
    public Potion(MapType map) {
        super(map);
        this.icon = "🧪";
    }

    @Override
    public void applyEffect(Snake s, GameManager gm) {
        s.heal(20);
        gm.playHeal();
    }

    @Override
    public Color getColor() {
        if (currentMap == MapType.SNOW) return Color.LIGHTBLUE;
        if (currentMap == MapType.DESERT) return Color.ORANGE;
        if (currentMap == MapType.FOREST) return Color.DARKGREEN;
        if (currentMap == MapType.NEON) return Color.CYAN;
        return Color.LIMEGREEN;
    }

    @Override
    public String getIcon() { return icon; }

    @Override
    public void drawOnCanvas(GraphicsContext gc, int cellSize) {
        double px = x * cellSize;
        double py = y * cellSize;
        double cx = px + cellSize / 2.0;
        double cy = py + cellSize / 2.0;

        gc.setFill(getColor());
        gc.fillRoundRect(cx - cellSize*0.2, cy - cellSize*0.15, cellSize*0.4, cellSize*0.5, 8, 8);
        gc.setFill(Color.rgb(255,255,255,0.6));
        gc.fillOval(cx - cellSize*0.1, cy - cellSize*0.05, cellSize*0.2, cellSize*0.2);
        gc.setFill(Color.WHITE);
        gc.setFont(Font.font(cellSize*0.4));
        gc.fillText("+", cx - 5, cy + 5);
    }
}