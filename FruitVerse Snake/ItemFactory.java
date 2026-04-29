public class ItemFactory {
    public static Item createFood(String type, MapType map) {
        return new Food(type, type.equals("bonus") ? 30 : 10, map);
    }

    public static Item createMapChanger(MapType map) {
        return new Food("map_fruit", 0, map);
    }

    public static Item createPotion(MapType map) {
        return new Potion(map);
    }

    public static Item createPoison(MapType map) {
        return new Poison(map);
    }
}