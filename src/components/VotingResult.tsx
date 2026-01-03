import { Card, Typography, Button, Space, List } from "antd";
import { Player } from "../types/game.types";
import { checkWinCondition } from "../utils/gameLogic";
import Timer from "./Timer";

const { Title, Text } = Typography;

interface VotingResultProps {
  eliminatedPlayer: Player;
  activePlayers: Player[];
  timeLeft: number;
  onTimeUpdate: (newTime: number) => void;
  onContinue: () => void;
  onGameEnd: () => void;
  onTimerExpired: () => void;
}

export default function VotingResult({
  eliminatedPlayer,
  activePlayers,
  timeLeft,
  onTimeUpdate,
  onContinue,
  onGameEnd,
  onTimerExpired,
}: VotingResultProps) {
  const winner = checkWinCondition(activePlayers);

  // Проверяем, был ли выбывший игрок последним шпионом
  const wasLastSpy = eliminatedPlayer.isSpy && winner === "civilians";

  const handleContinue = () => {
    if (winner) {
      onGameEnd();
    } else {
      onContinue();
    }
  };

  return (
    <div className="voting-result">
      <Title level={1} style={{ textAlign: "center", marginBottom: 24 }}>
        Результат голосования
      </Title>

      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {!winner && (
          <Card>
            <Timer
              timeLeft={timeLeft}
              onTimeUpdate={onTimeUpdate}
              isRunning={true}
              onTimeUp={onTimerExpired}
            />
          </Card>
        )}
        <Card>
          <Title level={2} style={{ textAlign: "center", margin: 0 }}>
            Выбыл: {eliminatedPlayer.name}
          </Title>
          {wasLastSpy && (
            <Text
              type="danger"
              strong
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 18,
                marginTop: 12,
              }}
            >
              Шпион!
            </Text>
          )}
        </Card>

        {winner && (
          <Card>
            <Title
              level={2}
              style={{
                textAlign: "center",
                color: winner === "spies" ? "#ff4444" : "#4a9eff",
                margin: 0,
              }}
            >
              {winner === "spies"
                ? "Победа шпионов!"
                : "Победа мирных жителей!"}
            </Title>
          </Card>
        )}

        <Card title={`Осталось игроков: ${activePlayers.length}`}>
          <List
            dataSource={activePlayers}
            renderItem={(player) => (
              <List.Item>
                <Text style={{ fontSize: 18 }}>{player.name}</Text>
              </List.Item>
            )}
          />
        </Card>

        <Button
          type="primary"
          size="large"
          block
          onClick={handleContinue}
          style={{ height: 50, fontSize: 18 }}
        >
          {winner ? "Новая игра" : "Продолжить игру"}
        </Button>
      </Space>
    </div>
  );
}
