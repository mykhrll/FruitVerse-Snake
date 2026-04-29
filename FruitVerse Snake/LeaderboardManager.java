import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;

public class LeaderboardManager {
    private static final String FILE_NAME = "leaderboard.dat";
    private List<LeaderboardEntry> entries = new ArrayList<>();

    public LeaderboardManager() {
        load();
    }

    public void addEntry(String name, int score) {
        entries.add(new LeaderboardEntry(name, score));
        entries.sort((a, b) -> Integer.compare(b.score, a.score));
        if (entries.size() > 10) entries = entries.subList(0, 10);
        save();
    }

    public List<LeaderboardEntry> getTop10() {
        return new ArrayList<>(entries);
    }

    @SuppressWarnings("unchecked")  // <- Tambahkan ini untuk menghilangkan peringatan
    private void load() {
        File f = new File(FILE_NAME);
        if (!f.exists()) return;
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(f))) {
            entries = (List<LeaderboardEntry>) ois.readObject();
        } catch (Exception e) {
            entries = new ArrayList<>();
        }
    }

    private void save() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            oos.writeObject(entries);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}