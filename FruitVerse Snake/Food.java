import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.shape.ArcType;

public class Food extends Item {
    private int points;
    private String foodType; // "normal", "bonus", "map_fruit"
    private String variant;

    public Food(String type, int points, MapType map) {
        super(map);
        this.foodType = type;
        this.points = points;
        if (type.equals("map_fruit")) {
            this.variant = "magic";
        } else if (type.equals("bonus")) {
            this.variant = "star";
        } else {
            switch (map) {
                case DARK: this.variant = "dark_berry"; break;
                case FOREST: this.variant = "forest_mushroom"; break;
                case DESERT: this.variant = "cactus_fruit"; break;
                case SNOW: this.variant = "ice_berry"; break;
                case NEON: this.variant = "neon_apple"; break;
                default: this.variant = "apple";
            }
        }
    }

    public String getFoodType() { return foodType; }
    public boolean isMapFruit() { return "map_fruit".equals(foodType); }

    @Override
    public void applyEffect(Snake s, GameManager gm) {
        if (isMapFruit()) {
            gm.triggerMapChange();
            return;
        }
        s.grow();
        gm.addScore(points);
        gm.addCoin(5);
    }

    @Override
    public Color getColor() {
        if (isMapFruit()) return Color.MAGENTA;
        if (foodType.equals("bonus")) return Color.GOLD;
        switch (variant) {
            case "dark_berry": return Color.DARKVIOLET;
            case "forest_mushroom": return Color.SADDLEBROWN;
            case "cactus_fruit": return Color.ORANGERED;
            case "ice_berry": return Color.CYAN;
            case "neon_apple": return Color.LIME;
            default: return Color.RED;
        }
    }

    @Override
    public String getIcon() { return ""; } // tidak perlu icon teks

    @Override
    public void drawOnCanvas(GraphicsContext gc, int cellSize) {
        double px = x * cellSize;
        double py = y * cellSize;
        double cx = px + cellSize/2;
        double cy = py + cellSize/2;
        double r = cellSize * 0.4;

        if (isMapFruit()) {
            drawMagicFruit(gc, cx, cy, r);
        } else if (foodType.equals("bonus")) {
            drawStar(gc, cx, cy, r);
        } else {
            drawFruit(gc, cx, cy, r);
        }
    }

    private void drawFruit(GraphicsContext gc, double cx, double cy, double r) {
        switch (variant) {
            case "apple":
                drawApple(gc, cx, cy, r);
                break;
            case "dark_berry":
                drawBerry(gc, cx, cy, r, Color.DARKVIOLET);
                break;
            case "forest_mushroom":
                drawMushroom(gc, cx, cy, r);
                break;
            case "cactus_fruit":
                drawCactusFruit(gc, cx, cy, r);
                break;
            case "ice_berry":
                drawBerry(gc, cx, cy, r, Color.CYAN);
                break;
            case "neon_apple":
                drawNeonApple(gc, cx, cy, r);
                break;
            default:
                drawApple(gc, cx, cy, r);
        }
    }

    private void drawApple(GraphicsContext gc, double cx, double cy, double r) {
        // Apel merah dengan daun
        gc.setFill(Color.CRIMSON);
        gc.fillOval(cx - r, cy - r*0.8, r*2, r*1.6);
        gc.setFill(Color.DARKGREEN);
        gc.fillOval(cx + r*0.4, cy - r*1.0, r*0.5, r*0.5);
        gc.setStroke(Color.BROWN);
        gc.setLineWidth(1.5);
        gc.strokeLine(cx + r*0.5, cy - r*0.9, cx + r*0.7, cy - r*1.1);
        // Kilap
        gc.setFill(Color.rgb(255,255,255,0.4));
        gc.fillOval(cx - r*0.4, cy - r*0.6, r*0.4, r*0.3);
    }

    private void drawBerry(GraphicsContext gc, double cx, double cy, double r, Color berryColor) {
        gc.setFill(berryColor);
        gc.fillOval(cx - r*0.8, cy - r*0.8, r*1.6, r*1.6);
        gc.setFill(Color.BLACK);
        gc.fillOval(cx - r*0.3, cy - r*0.3, 3, 3);
        gc.fillOval(cx + r*0.2, cy - r*0.3, 3, 3);
        gc.setFill(Color.LIMEGREEN);
        gc.fillOval(cx - r*0.2, cy - r*1.0, r*0.5, r*0.4);
    }

    private void drawMushroom(GraphicsContext gc, double cx, double cy, double r) {
        gc.setFill(Color.SADDLEBROWN);
        gc.fillRoundRect(cx - r*0.3, cy - r*0.2, r*0.6, r*0.8, 5, 5);
        gc.setFill(Color.DARKRED);
        gc.fillArc(cx - r*0.7, cy - r*0.8, r*1.4, r*0.8, 0, 180, ArcType.ROUND);
        gc.setFill(Color.WHITE);
        gc.fillOval(cx - r*0.4, cy - r*0.7, r*0.25, r*0.2);
        gc.fillOval(cx + r*0.15, cy - r*0.65, r*0.2, r*0.18);
    }

    private void drawCactusFruit(GraphicsContext gc, double cx, double cy, double r) {
        gc.setFill(Color.ORANGERED);
        gc.fillOval(cx - r*0.7, cy - r*0.7, r*1.4, r*1.4);
        gc.setFill(Color.DARKGREEN);
        for (int i = 0; i < 3; i++) {
            double angle = Math.toRadians(30 + i*120);
            double x = cx + Math.cos(angle)*r*0.8;
            double y = cy + Math.sin(angle)*r*0.8;
            gc.fillRect(x-1, y-4, 2, 8);
        }
    }

    private void drawNeonApple(GraphicsContext gc, double cx, double cy, double r) {
        // Apel neon dengan outline
        gc.setFill(Color.LIME);
        gc.fillOval(cx - r, cy - r*0.8, r*2, r*1.6);
        gc.setStroke(Color.CYAN);
        gc.setLineWidth(1);
        gc.strokeOval(cx - r, cy - r*0.8, r*2, r*1.6);
        gc.setFill(Color.MAGENTA);
        gc.fillOval(cx - r*0.3, cy - r*1.0, r*0.5, r*0.4);
    }

    private void drawStar(GraphicsContext gc, double cx, double cy, double r) {
        double[] xs = new double[10];
        double[] ys = new double[10];
        for (int k = 0; k < 10; k++) {
            double angle = Math.PI * k / 5 - Math.PI / 2;
            double radius = (k % 2 == 0) ? r : r * 0.42;
            xs[k] = cx + radius * Math.cos(angle);
            ys[k] = cy + radius * Math.sin(angle);
        }
        gc.setFill(Color.GOLD);
        gc.fillPolygon(xs, ys, 10);
        gc.setFill(Color.YELLOW);
        gc.fillPolygon(xs, ys, 10);
    }

    private void drawMagicFruit(GraphicsContext gc, double cx, double cy, double r) {
        gc.setFill(Color.rgb(255,0,255,0.8));
        gc.fillOval(cx - r, cy - r, r*2, r*2);
        gc.setFill(Color.YELLOW);
        gc.fillText("★", cx - r*0.3, cy + r*0.3);
    }
}