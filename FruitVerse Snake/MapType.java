public enum MapType {
    DARK("dark", "#0d1117", "bgm_dark.wav"),
    DESERT("desert", "#e8a44a", "bgm_desert.wav"),
    FOREST("forest", "#1a3a1a", "bgm_forest.wav"),
    NEON("neon", "#05001a", "bgm_neon.wav"),
    SNOW("snow", "#8ab4d8", "bgm_snow.wav");

    public final String key;
    public final String bgColor;
    public final String bgmFile;

    MapType(String key, String bgColor, String bgmFile) {
        this.key = key;
        this.bgColor = bgColor;
        this.bgmFile = bgmFile;
    }

    public static MapType next(MapType current) {
        MapType[] vals = values();
        return vals[(current.ordinal() + 1) % vals.length];
    }
}