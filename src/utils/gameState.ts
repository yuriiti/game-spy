import { Player, VotingState, GameSettings } from "../types/game.types";
import { getEliminatedPlayer } from "./gameLogic";

/**
 * Вычисляет активных игроков
 */
export function getActivePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.isActive);
}

/**
 * Обрабатывает завершение голосования и возвращает результат
 */
export function processVotingResult(
  players: Player[],
  votes: VotingState
): {
  eliminated: Player | null;
  updatedPlayers: Player[];
} {
  const eliminated = getEliminatedPlayer(players, votes);

  if (eliminated) {
    const updatedPlayers = players.map((p) =>
      p.id === eliminated.id ? { ...p, isActive: false } : p
    );
    return { eliminated, updatedPlayers };
  }

  return { eliminated: null, updatedPlayers: players };
}

/**
 * Создает начальное состояние игры
 */
export function createInitialGameState() {
  return {
    players: [] as Player[],
    settings: null as GameSettings | null,
    eliminatedPlayer: null as Player | null,
    timeLeft: 0,
  };
}

/**
 * Сбрасывает состояние игры к начальному
 */
export function resetGameState() {
  return createInitialGameState();
}
