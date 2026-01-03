import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useVoting } from "../useVoting";
import { Player } from "../../types/game.types";

describe("useVoting", () => {
  const mockPlayers: Player[] = [
    { id: "1", name: "Player 1", isActive: true, isSpy: false },
    { id: "2", name: "Player 2", isActive: true, isSpy: false },
    { id: "3", name: "Player 3", isActive: true, isSpy: false },
  ];

  const mockOnVotingComplete = vi.fn();
  const mockOnTieVote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should start with empty votes", () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete)
      );

      expect(result.current.votes).toEqual({});
      expect(result.current.voteCount).toBe(0);
      expect(result.current.allVoted).toBe(false);
    });
  });

  describe("handleVote", () => {
    it("should add vote correctly", () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete)
      );

      act(() => {
        result.current.handleVote("1");
      });

      expect(result.current.voteCount).toBe(1);
      expect(Object.keys(result.current.votes).length).toBe(1);
    });

    it("should increment vote count on each vote", () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete)
      );

      act(() => {
        result.current.handleVote("1");
      });
      expect(result.current.voteCount).toBe(1);
      expect(result.current.voteCounts["1"]).toBe(1);

      act(() => {
        result.current.handleVote("2");
      });
      expect(result.current.voteCount).toBe(2);
      expect(result.current.voteCounts["2"]).toBe(1);

      act(() => {
        result.current.handleVote("1");
      });
      expect(result.current.voteCount).toBe(3);
      expect(result.current.voteCounts["1"]).toBe(2);
      expect(result.current.voteCounts["2"]).toBe(1);
    });
  });

  describe("allVoted", () => {
    it("should be true when all players voted", () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete)
      );

      act(() => {
        result.current.handleVote("1");
        result.current.handleVote("2");
        result.current.handleVote("3");
      });

      expect(result.current.allVoted).toBe(true);
    });

    it("should be false when not all players voted", () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete)
      );

      act(() => {
        result.current.handleVote("1");
        result.current.handleVote("2");
      });

      expect(result.current.allVoted).toBe(false);
    });
  });

  describe("hasTie", () => {
    it("should not detect tie when one player has more votes", () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete)
      );

      act(() => {
        result.current.handleVote("1");
        result.current.handleVote("1");
        result.current.handleVote("2");
      });

      expect(result.current.hasTie).toBe(false);
    });
  });

  describe("voting completion", () => {
    it("should call onVotingComplete when all voted and no tie", async () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete, mockOnTieVote)
      );

      act(() => {
        result.current.handleVote("1");
        result.current.handleVote("1");
        result.current.handleVote("2");
      });

      await waitFor(() => {
        expect(mockOnVotingComplete).toHaveBeenCalled();
      });

      expect(mockOnTieVote).not.toHaveBeenCalled();
    });
  });

  describe("resetVotes", () => {
    it("should reset votes and vote count", () => {
      const { result } = renderHook(() =>
        useVoting(mockPlayers, mockOnVotingComplete)
      );

      act(() => {
        result.current.handleVote("1");
        result.current.handleVote("2");
        result.current.resetVotes();
      });

      expect(result.current.voteCount).toBe(0);
      expect(Object.keys(result.current.votes).length).toBe(0);
    });
  });

  describe("activePlayers", () => {
    it("should return only active players", () => {
      const playersWithInactive: Player[] = [
        { id: "1", name: "Player 1", isActive: true, isSpy: false },
        { id: "2", name: "Player 2", isActive: false, isSpy: false },
        { id: "3", name: "Player 3", isActive: true, isSpy: false },
      ];

      const { result } = renderHook(() =>
        useVoting(playersWithInactive, mockOnVotingComplete)
      );

      expect(result.current.activePlayers.length).toBe(2);
      expect(result.current.activePlayers.every((p) => p.isActive)).toBe(true);
    });
  });
});
