import {
  Player,
  GameSettings,
  WordCategory,
  WordsData,
} from "../types/game.types";
import wordsData from "../data/words.json";

/**
 * Генерирует уникальный идентификатор для игрока
 * @returns {string} Уникальный идентификатор игрока
 */
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Назначает роли игрокам (шпионы и мирные жители)
 * @param {Player[]} players - Массив игроков
 * @param {number} spyCount - Количество шпионов
 * @returns {Player[]} Массив игроков с назначенными ролями
 */
export function assignRoles(players: Player[], spyCount: number): Player[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const spies = shuffled.slice(0, spyCount);

  return players.map((player) => {
    const isSpy = spies.some((spy) => spy.id === player.id);
    return {
      ...player,
      isSpy,
    };
  });
}

/**
 * Определяет категорию слова
 * @param {string} word - Слово для поиска
 * @returns {WordCategory | null} Категория слова или null, если не найдена
 */
export function getWordCategory(word: string): WordCategory | null {
  const data = wordsData as WordsData;
  for (const [category, words] of Object.entries(data)) {
    if (words.includes(word)) {
      return category as WordCategory;
    }
  }
  return null;
}

/**
 * Выбирает случайное слово из указанных категорий
 * @param {WordCategory[]} categories - Массив категорий слов
 * @returns {{word: string, category: WordCategory}} Объект с выбранным словом и его реальной категорией
 * @throws {Error} Если категории не найдены или пусты
 */
export function selectRandomWord(categories: WordCategory[]): {
  word: string;
  category: WordCategory;
} {
  if (categories.length === 0) {
    throw new Error("Не выбрано ни одной категории");
  }

  const allWordsWithCategories: Array<{
    word: string;
    category: WordCategory;
  }> = [];
  const data = wordsData as WordsData;

  categories.forEach((cat) => {
    const words = data[cat];
    if (words && words.length > 0) {
      words.forEach((word) => {
        allWordsWithCategories.push({
          word,
          category: cat,
        });
      });
    }
  });

  if (allWordsWithCategories.length === 0) {
    throw new Error("База слов пуста для выбранных категорий");
  }

  const randomIndex = Math.floor(Math.random() * allWordsWithCategories.length);
  return allWordsWithCategories[randomIndex];
}

/**
 * Объект с подсказками для шпиона
 */
export interface SpyHints {
  category?: string;
  letterCount?: number;
  firstLetter?: string;
}

/**
 * Генерирует подсказки для шпиона на основе настроек игры
 * @param {string} word - Загаданное слово
 * @param {WordCategory} category - Категория слова
 * @param {GameSettings} settings - Настройки игры (какие подсказки показывать)
 * @returns {SpyHints} Объект с подсказками для шпиона
 */
export function generateSpyHints(
  word: string,
  category: WordCategory,
  settings: GameSettings
): SpyHints {
  const hints: SpyHints = {};

  if (settings.showCategoryToSpy) {
    hints.category = getCategoryDisplayName(category);
  }

  if (settings.showLetterCountToSpy) {
    hints.letterCount = word.length;
  }

  if (settings.showFirstLetterToSpy) {
    hints.firstLetter = word[0].toUpperCase();
  }

  return hints;
}

/**
 * Подсчитывает количество голосов за каждого игрока
 * @param {Record<string, string>} votes - Объект с голосами (id голосующего -> id за кого проголосовал)
 * @returns {Record<string, number>} Объект с количеством голосов за каждого игрока
 */
export function countVotes(
  votes: Record<string, string>
): Record<string, number> {
  const voteCounts: Record<string, number> = {};

  Object.values(votes).forEach((votedFor) => {
    voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
  });

  return voteCounts;
}

/**
 * Определяет игрока, который выбывает по результатам голосования
 * Выбывает игрок с наибольшим количеством голосов
 * Если несколько игроков имеют одинаковое максимальное количество голосов, возвращает null (голосование обнуляется)
 * @param {Player[]} players - Массив всех игроков
 * @param {Record<string, string>} votes - Объект с голосами
 * @returns {Player | null} Выбывший игрок или null, если никого не выбыло (включая случай равного количества голосов)
 */
export function getEliminatedPlayer(
  players: Player[],
  votes: Record<string, string>
): Player | null {
  const voteCounts = countVotes(votes);
  const activePlayers = players.filter((p) => p.isActive);

  if (activePlayers.length === 0) {
    return null;
  }

  let maxVotes = 0;
  const playersWithMaxVotes: string[] = [];

  activePlayers.forEach((player) => {
    const votesForPlayer = voteCounts[player.id] || 0;
    if (votesForPlayer > maxVotes) {
      maxVotes = votesForPlayer;
      playersWithMaxVotes.length = 0; // Очищаем массив
      playersWithMaxVotes.push(player.id);
    } else if (votesForPlayer === maxVotes && maxVotes > 0) {
      playersWithMaxVotes.push(player.id);
    }
  });

  // Если несколько игроков с максимальным количеством голосов - голосование обнуляется
  if (playersWithMaxVotes.length > 1) {
    return null;
  }

  // Если только один игрок с максимальным количеством голосов
  if (playersWithMaxVotes.length === 1 && maxVotes > 0) {
    return players.find((p) => p.id === playersWithMaxVotes[0]) || null;
  }

  return null;
}

/**
 * Проверяет, есть ли равное количество голосов у нескольких игроков
 * @param {Player[]} players - Массив всех игроков
 * @param {Record<string, string>} votes - Объект с голосами
 * @returns {boolean} true, если есть несколько игроков с одинаковым максимальным количеством голосов
 */
export function hasTieVote(
  players: Player[],
  votes: Record<string, string>
): boolean {
  const voteCounts = countVotes(votes);
  const activePlayers = players.filter((p) => p.isActive);

  if (activePlayers.length === 0) {
    return false;
  }

  let maxVotes = 0;
  const playersWithMaxVotes: string[] = [];

  activePlayers.forEach((player) => {
    const votesForPlayer = voteCounts[player.id] || 0;
    if (votesForPlayer > maxVotes) {
      maxVotes = votesForPlayer;
      playersWithMaxVotes.length = 0;
      playersWithMaxVotes.push(player.id);
    } else if (votesForPlayer === maxVotes && maxVotes > 0) {
      playersWithMaxVotes.push(player.id);
    }
  });

  return playersWithMaxVotes.length > 1;
}

/**
 * Проверяет условие победы в игре
 * @param {Player[]} activePlayers - Массив активных игроков
 * @returns {"spies" | "civilians" | null} Победитель или null, если игра продолжается
 * @description
 * - Победа мирных жителей: если не осталось шпионов
 * - Победа шпионов: если остался 1 шпион и 1 мирный житель
 * - null: игра продолжается
 */
export function checkWinCondition(
  activePlayers: Player[]
): "spies" | "civilians" | null {
  const activeSpies = activePlayers.filter((p) => p.isSpy && p.isActive);
  const activeCivilians = activePlayers.filter((p) => !p.isSpy && p.isActive);

  if (activeSpies.length === 0) {
    return "civilians";
  }

  if (activeSpies.length === 1 && activeCivilians.length === 1) {
    return "spies";
  }

  return null;
}

/**
 * Возвращает отображаемое название категории на русском языке
 * @param {WordCategory} category - Категория слов
 * @returns {string} Название категории на русском языке
 */
export function getCategoryDisplayName(category: WordCategory): string {
  const categoryNames: Record<WordCategory, string> = {
    animals: "Животные",
    cities: "Города",
    professions: "Профессии",
    objects: "Предметы",
    food: "Еда",
    drinks: "Напитки",
    smoking: "Курение",
    entertainment: "Развлечения",
    relationships: "Отношения",
    games: "Игры",
    hobbies: "Хобби",
    holidays: "Праздники",
    sports: "Спорт",
  };
  return categoryNames[category];
}
