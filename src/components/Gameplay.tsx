import { useState } from "react";
import { Button, Card, Typography, Space, message } from "antd";
import { Player, VotingState } from "../types/game.types";
import Timer from "./Timer";
import hintQuestionsData from "../data/hintQuestions.json";
import { useVoting } from "../hooks/useVoting";

const { Text } = Typography;

interface GameplayProps {
  players: Player[];
  timeLeft: number;
  onTimeUpdate: (newTime: number) => void;
  onVotingComplete: (votes: VotingState) => void;
  onTimerExpired: () => void;
}

export default function Gameplay({
  players,
  timeLeft,
  onTimeUpdate,
  onVotingComplete,
  onTimerExpired,
}: GameplayProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const questions = hintQuestionsData.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const { voteCounts, hasTie, allVoted, activePlayers, handleVote } = useVoting(
    players,
    onVotingComplete,
    () => {
      message.warning("Обнуление голосов");
    }
  );

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  const handleTimeUp = () => {
    // Если таймер истек, шпионы выигрывают
    onTimerExpired();
  };

  return (
    <div className="gameplay">
      <Card>
        <Timer
          timeLeft={timeLeft}
          onTimeUpdate={onTimeUpdate}
          isRunning={true}
          onTimeUp={handleTimeUp}
        />
      </Card>

      <Card title="Подсказка">
        <Space orientation="vertical" style={{ width: "100%" }} size="middle">
          <Text style={{ fontSize: 18, textAlign: "center", display: "block" }}>
            {currentQuestion}
          </Text>
          <Button block onClick={nextQuestion}>
            След. вопрос
          </Button>
        </Space>
      </Card>

      <Card title="Голосование">
        <Space orientation="vertical" style={{ width: "100%" }} size="middle">
          <Text
            type="secondary"
            style={{ textAlign: "center", display: "block" }}
          >
            Нажмите на игрока, чтобы проголосовать за него
          </Text>
          <Space orientation="vertical" style={{ width: "100%" }} size="small">
            {activePlayers.map((player) => {
              const votesForPlayer = voteCounts[player.id] || 0;
              return (
                <Button
                  key={player.id}
                  onClick={() => handleVote(player.id)}
                  disabled={allVoted}
                  block
                  size="large"
                  style={{
                    height: 60,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Text strong style={{ fontSize: 18 }}>
                    {player.name}
                  </Text>
                  <Text
                    strong
                    style={{ fontSize: 24, color: "#4a9eff", minWidth: 40 }}
                  >
                    {votesForPlayer}
                  </Text>
                </Button>
              );
            })}
          </Space>
          {allVoted && (
            <Text
              strong
              style={{
                textAlign: "center",
                display: "block",
                color: hasTie ? "#ff7875" : "#4a9eff",
                fontSize: 18,
                marginTop: 16,
              }}
            >
              {hasTie
                ? "Равное количество голосов! Голосование обнулено."
                : "Все проголосовали! Результаты..."}
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
}
