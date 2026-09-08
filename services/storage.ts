/**
 * Thin wrapper around Expo SecureStore for anything sensitive (tokens), and
 * AsyncStorage for everything else (cached, non-sensitive profile data).
 * Centralizing this means auth.ts never touches a storage API directly.
 */
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn(`[secureStorage] failed to read "${key}"`, e);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn(`[secureStorage] failed to write "${key}"`, e);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn(`[secureStorage] failed to remove "${key}"`, e);
    }
  },
};

export const appStorage = {
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      console.warn(`[appStorage] failed to read "${key}"`, e);
      return null;
    }
  },
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[appStorage] failed to write "${key}"`, e);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`[appStorage] failed to remove "${key}"`, e);
    }
  },
};
