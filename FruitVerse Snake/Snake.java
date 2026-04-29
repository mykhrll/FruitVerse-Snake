import java.util.LinkedList;

public class Snake {
    private LinkedList<int[]> body = new LinkedList<>();
    private int dx = 1, dy = 0;
    private int health = 100;
    private int coins;

    public Snake(int coins) {
        this.coins = coins;
        body.add(new int[]{10,10});
        body.add(new int[]{9,10});
        body.add(new int[]{8,10});
    }

    public void move() {
        int[] head = body.getFirst();
        int newX = head[0] + dx;
        int newY = head[1] + dy;
        body.addFirst(new int[]{newX, newY});
        body.removeLast();
    }

    public void grow() {
        int[] last = body.getLast();
        body.addLast(new int[]{last[0], last[1]});
    }

    public boolean checkSelfCollision() {
        int[] head = body.getFirst();
        for (int i = 1; i < body.size(); i++) {
            if (body.get(i)[0] == head[0] && body.get(i)[1] == head[1]) return true;
        }
        return false;
    }

    public void setDirection(int dx, int dy) {
        if ((this.dx != -dx || this.dy != -dy) && (dx != 0 || dy != 0)) {
            this.dx = dx;
            this.dy = dy;
        }
    }

    public void takeDamage(int dmg) { health = Math.max(0, health - dmg); }
    public void heal(int val) { health = Math.min(100, health + val); }
    public void addCoins(int val) { coins += val; }

    public int getHeadX() { return body.getFirst()[0]; }
    public int getHeadY() { return body.getFirst()[1]; }
    public void setHeadX(int x) { body.getFirst()[0] = x; }
    public void setHeadY(int y) { body.getFirst()[1] = y; }
    public LinkedList<int[]> getBody() { return body; }
    public int getHealth() { return health; }
    public int getCoins() { return coins; }
}