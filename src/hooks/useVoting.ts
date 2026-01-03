import { useState, useEffect, useCallback, useRef } from "react";
import { Player, VotingState } from "../types/game.types";
import { countVotes, hasTieVote } from "../utils/gameLogic";

export interface VotingHookState {
  votes: VotingState;
  voteCount: number;
  voteCounts: Record<string, number>;
  hasTie: boolean;
  allVoted: boolean;
}

export interface VotingHookActions {
  handleVote: (targetId: string) => void;
  resetVotes: () => void;
}

/**
 * Хук для управления голосованием
 */
export function useVoting(
  players: Player[],
  onVotingComplete: (votes: VotingState) => void,
  onTieVote?: () => void
) {
  const [votes, setVotes] = useState<VotingState>({});
  const [voteCount, setVoteCount] = useState<number>(0);

  // Используем useRef для стабильных ссылок на колбэки
  const onVotingCompleteRef = useRef(onVotingComplete);
  const onTieVoteRef = useRef(onTieVote);

  useEffect(() => {
    onVotingCompleteRef.current = onVotingComplete;
    onTieVoteRef.current = onTieVote;
  }, [onVotingComplete, onTieVote]);

  const activePlayers = players.filter((p) => p.isActive);
  const voteCounts = countVotes(votes);
  const hasTie = hasTieVote(players, votes);
  const allVoted = voteCount >= activePlayers.length;

  const handleVote = useCallback(
    (targetId: string) => {
      const voterId = `voter_${voteCount}`;
      setVotes((prev) => ({ ...prev, [voterId]: targetId }));
      setVoteCount((prev) => prev + 1);
    },
    [voteCount]
  );

  const resetVotes = useCallback(() => {
    setVotes({});
    setVoteCount(0);
  }, []);

  useEffect(() => {
    if (allVoted && activePlayers.length > 0 && Object.keys(votes).length > 0) {
      if (hasTie) {
        if (onTieVoteRef.current) {
          onTieVoteRef.current();
        }
        resetVotes();
      } else {
        onVotingCompleteRef.current(votes);
      }
    }
  }, [allVoted, votes, activePlayers.length, hasTie, resetVotes]);

  return {
    votes,
    voteCount,
    voteCounts,
    hasTie,
    allVoted,
    activePlayers,
    handleVote,
    resetVotes,
  };
}
