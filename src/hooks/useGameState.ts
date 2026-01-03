import { useState, useCallback } from "react";
import {
  Player,
  GameSettings,
  GameStage,
  VotingState,
} from "../types/game.types";
import { assignRoles } from "../utils/gameLogic";
import {
  getActivePlayers,
  processVotingResult,
  createInitialGameState,
  resetGameState as resetState,
} from "../utils/gameState";

export interface GameState {
  stage: GameStage;
  players: Player[];
  settings: GameSettings | null;
  eliminatedPlayer: Player | null;
  timeLeft: number;
}

export interface GameStateActions {
  startGame: (players: Player[], settings: GameSettings) => void;
  completeRoleReveal: () => void;
  completeVoting: (votes: VotingState) => void;
  continueGame: () => void;
  endGame: () => void;
  timerExpired: () => void;
  updateTime: (time: number) => void;
  reset: () => void;
}

/**
 * Хук для управления состоянием игры
 */
export function useGameState() {
  const [state, setState] = useState<GameState>(() => ({
    stage: "setup",
    ...createInitialGameState(),
  }));

  const startGame = useCallback(
    (initialPlayers: Player[], gameSettings: GameSettings) => {
      const playersWithRoles = assignRoles(
        initialPlayers,
        gameSettings.spyCount
      );
      setState({
        stage: "roleReveal",
        players: playersWithRoles,
        settings: gameSettings,
        eliminatedPlayer: null,
        timeLeft: gameSettings.timerDuration,
      });
    },
    []
  );

  const completeRoleReveal = useCallback(() => {
    setState((prev) => ({ ...prev, stage: "gameplay" }));
  }, []);

  const completeVoting = useCallback((votes: VotingState) => {
    setState((prev) => {
      const { eliminated, updatedPlayers } = processVotingResult(
        prev.players,
        votes
      );

      if (eliminated) {
        return {
          ...prev,
          players: updatedPlayers,
          eliminatedPlayer: eliminated,
          stage: "votingResult",
        };
      }

      return prev;
    });
  }, []);

  const continueGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      eliminatedPlayer: null,
      stage: "gameplay",
    }));
  }, []);

  const endGame = useCallback(() => {
    setState({
      stage: "setup",
      ...resetState(),
    });
  }, []);

  const timerExpired = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stage: "timerExpired",
    }));
  }, []);

  const updateTime = useCallback((time: number) => {
    setState((prev) => ({ ...prev, timeLeft: time }));
  }, []);

  const reset = useCallback(() => {
    setState({
      stage: "setup",
      ...resetState(),
    });
  }, []);

  const activePlayers = getActivePlayers(state.players);

  return {
    state,
    activePlayers,
    actions: {
      startGame,
      completeRoleReveal,
      completeVoting,
      continueGame,
      endGame,
      timerExpired,
      updateTime,
      reset,
    },
  };
}
