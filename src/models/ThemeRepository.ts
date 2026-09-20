/**
 * MODEL LAYER — persistência da preferência de aparência (tema).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeMode } from "./types";

const STORAGE_KEY = "@meudinheiro:theme_mode";

export class ThemeRepository {
  static async get(): Promise<ThemeMode | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return null;
  }

  static async set(mode: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  }
}
