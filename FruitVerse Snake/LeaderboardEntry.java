import java.io.Serializable;

public class LeaderboardEntry implements Serializable {
    private static final long serialVersionUID = 1L;
    public String name;
    public int score;

    public LeaderboardEntry(String name, int score) {
        this.name = name;
        this.score = score;
    }
}