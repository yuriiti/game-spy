import { describe, it, expect } from "vitest";
import {
  getActivePlayers,
  processVotingResult,
  createInitialGameState,
  resetGameState,
} from "../gameState";
import { Player, VotingState } from "../../types/game.types";

describe("gameState", () => {
  describe("getActivePlayers", () => {
    it("should return only active players", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: false, isSpy: false },
        { id: "3", name: "Player 3", isActive: true, isSpy: true },
        { id: "4", name: "Player 4", isActive: false, isSpy: true },
      ];

      const result = getActivePlayers(players);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("3");
      expect(result.every((p) => p.isActive)).toBe(true);
    });

    it("should return empty array when no active players", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: false, isSpy: false },
        { id: "2", name: "Player 2", isActive: false, isSpy: false },
      ];

      const result = getActivePlayers(players);
      expect(result).toHaveLength(0);
    });

    it("should return all players when all are active", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
      ];

      const result = getActivePlayers(players);
      expect(result).toHaveLength(2);
    });
  });

  describe("processVotingResult", () => {
    it("should eliminate player with most votes", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
        { id: "3", name: "Player 3", isActive: true, isSpy: false },
      ];

      const votes: VotingState = {
        voter1: "1",
        voter2: "1",
        voter3: "2",
      };

      const result = processVotingResult(players, votes);

      expect(result.eliminated).not.toBeNull();
      expect(result.eliminated?.id).toBe("1");
      expect(result.updatedPlayers[0].isActive).toBe(false);
      expect(result.updatedPlayers[1].isActive).toBe(true);
      expect(result.updatedPlayers[2].isActive).toBe(true);
    });

    it("should return null eliminated for tie votes", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
      ];

      const votes: VotingState = {
        voter1: "1",
        voter2: "2",
      };

      const result = processVotingResult(players, votes);

      expect(result.eliminated).toBeNull();
      expect(result.updatedPlayers).toEqual(players);
    });

    it("should return null eliminated for empty votes", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
      ];

      const result = processVotingResult(players, {});

      expect(result.eliminated).toBeNull();
      expect(result.updatedPlayers).toEqual(players);
    });

    it("should preserve player properties when eliminating", () => {
      const players: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: true },
        { id: "2", name: "Player 2", isActive: true, isSpy: false },
      ];

      const votes: VotingState = {
        voter1: "1",
        voter2: "1",
      };

      const result = processVotingResult(players, votes);

      expect(result.eliminated?.isSpy).toBe(true);
      expect(result.updatedPlayers[0].isSpy).toBe(true);
      expect(result.updatedPlayers[0].name).toBe("Player 1");
    });
  });

  describe("createInitialGameState", () => {
    it("should return initial state with empty values", () => {
      const state = createInitialGameState();

      expect(state.players).toEqual([]);
      expect(state.settings).toBeNull();
      expect(state.eliminatedPlayer).toBeNull();
      expect(state.timeLeft).toBe(0);
    });
  });

  describe("resetGameState", () => {
    it("should return same structure as createInitialGameState", () => {
      const reset = resetGameState();
      const initial = createInitialGameState();

      expect(reset).toEqual(initial);
    });
  });
});
