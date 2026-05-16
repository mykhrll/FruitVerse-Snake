import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

public class Poison extends Item {
    public Poison(MapType map) {
        super(map);
        this.icon = "☠️";
    }

    @Override
    public void applyEffect(Snake s, GameManager gm) {
        s.takeDamage(10);
        gm.playDamage();
    }

    @Override
    public Color getColor() {
        if (currentMap == MapType.SNOW) return Color.rgb(0, 100, 200);
        if (currentMap == MapType.DESERT) return Color.rgb(200, 100, 0);
        if (currentMap == MapType.FOREST) return Color.rgb(50, 150, 50);
        if (currentMap == MapType.NEON) return Color.rgb(255, 0, 255);
        return Color.MEDIUMPURPLE;
    }

    @Override
    public String getIcon() { return icon; }

    @Override
    public void drawOnCanvas(GraphicsContext gc, int cellSize) {
        double px = x * cellSize;
        double py = y * cellSize;
        double cx = px + cellSize / 2.0;
        double cy = py + cellSize / 2.0;

        if (currentMap == MapType.SNOW) {
            // Ice bomb
            gc.setFill(Color.rgb(0, 150, 255));
            gc.fillOval(cx - cellSize*0.3, cy - cellSize*0.3, cellSize*0.6, cellSize*0.6);
            gc.setFill(Color.WHITE);
            for (int i = 0; i < 6; i++) {
                double angle = Math.toRadians(i * 60);
                double dx = Math.cos(angle) * cellSize*0.4;
                double dy = Math.sin(angle) * cellSize*0.4;
                gc.fillOval(cx + dx - 2, cy + dy - 2, 4, 4);
            }
        } else {
            // Skull
            gc.setFill(Color.MEDIUMPURPLE);
            gc.fillOval(cx - cellSize*0.3, cy - cellSize*0.3, cellSize*0.6, cellSize*0.5);
            gc.setFill(Color.BLACK);
            gc.fillOval(cx - cellSize*0.15, cy - cellSize*0.1, cellSize*0.1, cellSize*0.12);
            gc.fillOval(cx + cellSize*0.05, cy - cellSize*0.1, cellSize*0.1, cellSize*0.12);
            gc.fillRect(cx - cellSize*0.08, cy + cellSize*0.05, cellSize*0.16, cellSize*0.08);
        }
    }
}