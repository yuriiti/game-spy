import { VotingState } from "./types/game.types";
import { useGameState } from "./hooks/useGameState";
import GameSetup from "./components/GameSetup";
import RoleReveal from "./components/RoleReveal";
import Gameplay from "./components/Gameplay";
import VotingResult from "./components/VotingResult";
import TimerExpired from "./components/TimerExpired";

function App() {
  const { state, activePlayers, actions } = useGameState();

  const handleVotingComplete = (votingState: VotingState) => {
    actions.completeVoting(votingState);
  };

  const handleTimerExpired = () => {
    // Если таймер истек, шпионы выигрывают
    actions.timerExpired();
  };

  // votes используется в handleVotingComplete для определения выбывшего игрока

  return (
    <div className="app">
      {state.stage === "setup" && <GameSetup onStartGame={actions.startGame} />}
      {state.stage === "roleReveal" && state.settings && (
        <RoleReveal
          players={state.players}
          settings={state.settings}
          onComplete={actions.completeRoleReveal}
        />
      )}
      {state.stage === "gameplay" && state.settings && (
        <Gameplay
          players={state.players}
          timeLeft={state.timeLeft}
          onTimeUpdate={actions.updateTime}
          onVotingComplete={handleVotingComplete}
          onTimerExpired={handleTimerExpired}
        />
      )}
      {state.stage === "votingResult" &&
        state.eliminatedPlayer &&
        state.settings && (
          <VotingResult
            eliminatedPlayer={state.eliminatedPlayer}
            activePlayers={activePlayers}
            timeLeft={state.timeLeft}
            onTimeUpdate={actions.updateTime}
            onContinue={actions.continueGame}
            onGameEnd={actions.endGame}
            onTimerExpired={handleTimerExpired}
          />
        )}
      {state.stage === "timerExpired" && (
        <TimerExpired players={state.players} onNewGame={actions.endGame} />
      )}
    </div>
  );
}

export default App;
