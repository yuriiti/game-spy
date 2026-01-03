import { describe, it, expect } from "vitest";
import {
  generatePlayerId,
  assignRoles,
  getWordCategory,
  selectRandomWord,
  generateSpyHints,
  countVotes,
  getEliminatedPlayer,
  hasTieVote,
  checkWinCondition,
  getCategoryDisplayName,
} from "../gameLogic";
import {
  Player,
  GameSettings,
  WordCategory,
  VotingState,
} from "../../types/game.types";
import wordsData from "../../data/words.json";

describe("gameLogic", () => {
  describe("generatePlayerId", () => {
    it("should generate unique IDs", () => {
      const id1 = generatePlayerId();
      const id2 = generatePlayerId();
      expect(id1).not.toBe(id2);
      expect(id1).toContain("player_");
    });
  });

  describe("assignRoles", () => {
    it("should assign correct number of spies", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
        { id: "3", name: "Player 3", isActive: true, isSpy: false },
        { id: "4", name: "Player 4", isActive: true, isSpy: false },
      ];

      const result = assignRoles(players, 2);
      const spies = result.filter((p) => p.isSpy);
      const civilians = result.filter((p) => !p.isSpy);

      expect(spies.length).toBe(2);
      expect(civilians.length).toBe(2);
    });

    it("should assign all players as spies if spyCount equals player count", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
      ];

      const result = assignRoles(players, 2);
      const spies = result.filter((p) => p.isSpy);

      expect(spies.length).toBe(2);
    });

    it("should preserve player properties", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
      ];

      const result = assignRoles(players, 0);
      expect(result[0].id).toBe("1");
      expect(result[0].name).toBe("Player 1");
      expect(result[0].isActive).toBe(true);
    });
  });

  describe("getWordCategory", () => {
    it("should return correct category for existing word", () => {
      const data = wordsData as Record<string, string[]>;
      const testWord = data.animals?.[0];
      if (testWord) {
        const category = getWordCategory(testWord);
        expect(category).toBe("animals");
      }
    });

    it("should return null for non-existent word", () => {
      const category = getWordCategory("NonExistentWord12345");
      expect(category).toBeNull();
    });
  });

  describe("selectRandomWord", () => {
    it("should return word from selected category", () => {
      const categories: WordCategory[] = ["animals"];
      const result = selectRandomWord(categories);

      expect(result.word).toBeTruthy();
      expect(result.category).toBe("animals");
      expect(typeof result.word).toBe("string");
    });

    it("should return word from multiple categories", () => {
      const categories: WordCategory[] = ["animals", "cities"];
      const result = selectRandomWord(categories);

      expect(result.word).toBeTruthy();
      expect(["animals", "cities"]).toContain(result.category);
    });

    it("should throw error for empty categories", () => {
      expect(() => selectRandomWord([])).toThrow(
        "Не выбрано ни одной категории"
      );
    });
  });

  describe("generateSpyHints", () => {
    const baseSettings: GameSettings = {
      spyCount: 1,
      categories: ["animals"],
      timerDuration: 300,
      showCategoryToSpy: false,
      showLetterCountToSpy: false,
      showFirstLetterToSpy: false,
    };

    it("should generate category hint when enabled", () => {
      const settings = { ...baseSettings, showCategoryToSpy: true };
      const hints = generateSpyHints("собака", "animals", settings);

      expect(hints.category).toBe("Животные");
    });

    it("should generate letter count hint when enabled", () => {
      const settings = { ...baseSettings, showLetterCountToSpy: true };
      const hints = generateSpyHints("собака", "animals", settings);

      expect(hints.letterCount).toBe(6);
    });

    it("should generate first letter hint when enabled", () => {
      const settings = { ...baseSettings, showFirstLetterToSpy: true };
      const hints = generateSpyHints("собака", "animals", settings);

      expect(hints.firstLetter).toBe("С");
    });

    it("should generate all hints when all enabled", () => {
      const settings = {
        ...baseSettings,
        showCategoryToSpy: true,
        showLetterCountToSpy: true,
        showFirstLetterToSpy: true,
      };
      const hints = generateSpyHints("собака", "animals", settings);

      expect(hints.category).toBe("Животные");
      expect(hints.letterCount).toBe(6);
      expect(hints.firstLetter).toBe("С");
    });

    it("should generate no hints when all disabled", () => {
      const hints = generateSpyHints("собака", "animals", baseSettings);

      expect(hints.category).toBeUndefined();
      expect(hints.letterCount).toBeUndefined();
      expect(hints.firstLetter).toBeUndefined();
    });
  });

  describe("countVotes", () => {
    it("should count votes correctly", () => {
      const votes: VotingState = {
        voter1: "player1",
        voter2: "player1",
        voter3: "player2",
      };

      const result = countVotes(votes);

      expect(result["player1"]).toBe(2);
      expect(result["player2"]).toBe(1);
    });

    it("should return empty object for empty votes", () => {
      const result = countVotes({});
      expect(Object.keys(result).length).toBe(0);
    });

    it("should handle multiple votes for same player", () => {
      const votes: VotingState = {
        voter1: "player1",
        voter2: "player1",
        voter3: "player1",
      };

      const result = countVotes(votes);
      expect(result["player1"]).toBe(3);
    });
  });

  describe("getEliminatedPlayer", () => {
    const players: Player[] = [
      { id: "1", name: "Player 1", isActive: true, isSpy: false },
      { id: "2", name: "Player 2", isActive: true, isSpy: false },
      { id: "3", name: "Player 3", isActive: true, isSpy: false },
    ];

    it("should return player with most votes", () => {
      const votes: VotingState = {
        voter1: "1",
        voter2: "1",
        voter3: "2",
      };

      const result = getEliminatedPlayer(players, votes);
      expect(result).not.toBeNull();
      expect(result?.id).toBe("1");
    });

    it("should return null for tie votes", () => {
      const votes: VotingState = {
        voter1: "1",
        voter2: "2",
      };

      const result = getEliminatedPlayer(players, votes);
      expect(result).toBeNull();
    });

    it("should return null for empty votes", () => {
      const result = getEliminatedPlayer(players, {});
      expect(result).toBeNull();
    });

    it("should return null when no active players", () => {
      const inactivePlayers: Player[] = [
        { id: "1", name: "Player 1", isActive: false, isSpy: false },
      ];
      const votes: VotingState = { voter1: "1" };

      const result = getEliminatedPlayer(inactivePlayers, votes);
      expect(result).toBeNull();
    });

    it("should handle three-way tie", () => {
      const votes: VotingState = {
        voter1: "1",
        voter2: "2",
        voter3: "3",
      };

      const result = getEliminatedPlayer(players, votes);
      expect(result).toBeNull();
    });
  });

  describe("hasTieVote", () => {
    const players: Player[] = [
      { id: "1", name: "Player 1", isActive: true, isSpy: false },
      { id: "2", name: "Player 2", isActive: true, isSpy: false },
      { id: "3", name: "Player 3", isActive: true, isSpy: false },
    ];

    it("should return true for tie votes", () => {
      const votes: VotingState = {
        voter1: "1",
        voter2: "2",
      };

      expect(hasTieVote(players, votes)).toBe(true);
    });

    it("should return false when one player has more votes", () => {
      const votes: VotingState = {
        voter1: "1",
        voter2: "1",
        voter3: "2",
      };

      expect(hasTieVote(players, votes)).toBe(false);
    });

    it("should return false for empty votes", () => {
      expect(hasTieVote(players, {})).toBe(false);
    });

    it("should return true for three-way tie", () => {
      const votes: VotingState = {
        voter1: "1",
        voter2: "2",
        voter3: "3",
      };

      expect(hasTieVote(players, votes)).toBe(true);
    });
  });

  describe("checkWinCondition", () => {
    it("should return civilians when no spies left", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
      ];

      expect(checkWinCondition(players)).toBe("civilians");
    });

    it("should return spies when 1 spy and 1 civilian remain", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: true },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
      ];

      expect(checkWinCondition(players)).toBe("spies");
    });

    it("should return null when game continues", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: true },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
        { id: "3", name: "Player 3", isActive: true, isSpy: false },
      ];

      expect(checkWinCondition(players)).toBeNull();
    });

    it("should return null when multiple spies remain", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: true },
        { id: "2", name: "Player 2", isActive: true, isSpy: true },
        { id: "3", name: "Player 3", isActive: true, isSpy: false },
      ];

      expect(checkWinCondition(players)).toBeNull();
    });

    it("should ignore inactive players", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: false, isSpy: true },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
      ];

      expect(checkWinCondition(players)).toBe("civilians");
    });
  });

  describe("getCategoryDisplayName", () => {
    it("should return correct Russian name for each category", () => {
      expect(getCategoryDisplayName("animals")).toBe("Животные");
      expect(getCategoryDisplayName("cities")).toBe("Города");
      expect(getCategoryDisplayName("professions")).toBe("Профессии");
      expect(getCategoryDisplayName("objects")).toBe("Предметы");
      expect(getCategoryDisplayName("food")).toBe("Еда");
    });
  });
});
