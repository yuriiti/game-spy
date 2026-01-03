import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "../useGameState";
import { Player, GameSettings, VotingState } from "../../types/game.types";

describe("useGameState", () => {
  const mockPlayers: Player[] = [
    { id: "1", name: "Player 1", isActive: true, isSpy: false },
    { id: "2", name: "Player 2", isActive: true, isSpy: false },
    { id: "3", name: "Player 3", isActive: true, isSpy: false },
  ];

  const mockSettings: GameSettings = {
    spyCount: 1,
    categories: ["animals"],
    timerDuration: 300,
    showCategoryToSpy: true,
    showLetterCountToSpy: false,
    showFirstLetterToSpy: false,
  };

  describe("initial state", () => {
    it("should start with setup stage", () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.state.stage).toBe("setup");
      expect(result.current.state.players).toEqual([]);
      expect(result.current.state.settings).toBeNull();
    });
  });

  describe("startGame", () => {
    it("should set game state correctly", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
      });

      expect(result.current.state.stage).toBe("roleReveal");
      expect(result.current.state.players.length).toBe(3);
      expect(result.current.state.settings).toEqual(mockSettings);
      expect(result.current.state.timeLeft).toBe(300);
    });

    it("should assign roles to players", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
      });

      const spies = result.current.state.players.filter((p) => p.isSpy);
      expect(spies.length).toBe(1);
    });
  });

  describe("completeRoleReveal", () => {
    it("should change stage to gameplay", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
        result.current.actions.completeRoleReveal();
      });

      expect(result.current.state.stage).toBe("gameplay");
    });
  });

  describe("completeVoting", () => {
    it("should eliminate player and change to votingResult stage", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
        result.current.actions.completeRoleReveal();
      });

      const votes: VotingState = {
        voter1: "1",
        voter2: "1",
        voter3: "2",
      };

      act(() => {
        result.current.actions.completeVoting(votes);
      });

      expect(result.current.state.stage).toBe("votingResult");
      expect(result.current.state.eliminatedPlayer).not.toBeNull();
      expect(result.current.state.eliminatedPlayer?.id).toBe("1");
      expect(result.current.activePlayers.length).toBe(2);
    });

    it("should not change stage for tie votes", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
        result.current.actions.completeRoleReveal();
      });

      const votes: VotingState = {
        voter1: "1",
        voter2: "2",
      };

      act(() => {
        result.current.actions.completeVoting(votes);
      });

      expect(result.current.state.stage).toBe("gameplay");
      expect(result.current.state.eliminatedPlayer).toBeNull();
    });
  });

  describe("continueGame", () => {
    it("should reset eliminated player and return to gameplay", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
        result.current.actions.completeRoleReveal();
      });

      const votes: VotingState = {
        voter1: "1",
        voter2: "1",
      };

      act(() => {
        result.current.actions.completeVoting(votes);
        result.current.actions.continueGame();
      });

      expect(result.current.state.stage).toBe("gameplay");
      expect(result.current.state.eliminatedPlayer).toBeNull();
    });
  });

  describe("endGame", () => {
    it("should reset to setup stage", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
        result.current.actions.endGame();
      });

      expect(result.current.state.stage).toBe("setup");
      expect(result.current.state.players).toEqual([]);
      expect(result.current.state.settings).toBeNull();
      expect(result.current.state.timeLeft).toBe(0);
    });
  });

  describe("updateTime", () => {
    it("should update timeLeft", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
        result.current.actions.updateTime(250);
      });

      expect(result.current.state.timeLeft).toBe(250);
    });
  });

  describe("activePlayers", () => {
    it("should return only active players", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.actions.startGame(mockPlayers, mockSettings);
      });

      const initialActive = result.current.activePlayers.length;
      expect(initialActive).toBe(3);

      const votes: VotingState = {
        voter1: "1",
        voter2: "1",
      };

      act(() => {
        result.current.actions.completeVoting(votes);
      });

      expect(result.current.activePlayers.length).toBe(2);
    });
  });
});
