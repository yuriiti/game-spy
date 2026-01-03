import { GameSettings, WordCategory } from "../types/game.types";

const SETTINGS_STORAGE_KEY = "spy-game-settings";
const PLAYERS_STORAGE_KEY = "spy-game-players";

const DEFAULT_SETTINGS: Partial<GameSettings> = {
  spyCount: 1,
  categories: [
    "animals",
    "cities",
    "professions",
    "objects",
    "food",
  ] as WordCategory[],
  timerDuration: 300,
  showCategoryToSpy: true,
  showLetterCountToSpy: false,
  showFirstLetterToSpy: false,
};

const DEFAULT_PLAYERS: string[] = ["", "", ""];

/**
 * Сохраняет настройки игры в localStorage
 */
export function saveSettings(settings: Partial<GameSettings>): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Ошибка при сохранении настроек:", error);
  }
}

/**
 * Загружает настройки игры из localStorage
 */
export function loadSettings(): Partial<GameSettings> {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Валидация и объединение с дефолтными значениями
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        // Убеждаемся, что categories - это массив
        categories: Array.isArray(parsed.categories)
          ? parsed.categories
          : DEFAULT_SETTINGS.categories,
      };
    }
  } catch (error) {
    console.error("Ошибка при загрузке настроек:", error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Сохраняет имена игроков в localStorage
 */
export function savePlayers(playerNames: string[]): void {
  try {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(playerNames));
  } catch (error) {
    console.error("Ошибка при сохранении игроков:", error);
  }
}

/**
 * Загружает имена игроков из localStorage
 */
export function loadPlayers(): string[] {
  try {
    const stored = localStorage.getItem(PLAYERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Убеждаемся, что это массив строк
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        // Убеждаемся, что минимум 3 игрока
        return parsed.length >= 3 ? parsed : DEFAULT_PLAYERS;
      }
    }
  } catch (error) {
    console.error("Ошибка при загрузке игроков:", error);
  }
  return DEFAULT_PLAYERS;
}
