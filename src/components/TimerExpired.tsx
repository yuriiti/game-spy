import { Card, Typography, Button, Space, List } from "antd";
import { Player } from "../types/game.types";

const { Title, Text } = Typography;

interface TimerExpiredProps {
  players: Player[];
  onNewGame: () => void;
}

export default function TimerExpired({
  players,
  onNewGame,
}: TimerExpiredProps) {
  const spies = players.filter((p) => p.isSpy);

  return (
    <div className="timer-expired">
      <Space
        orientation="vertical"
        size="large"
        style={{ width: "100%", textAlign: "center" }}
      >
        <Card size="default">
          <Space orientation="vertical" size="middle">
            <Title level={3} type="secondary" style={{ margin: 0 }}>
              Время вышло!
            </Title>
            <Title level={2} type="danger" style={{ margin: 0 }}>
              Победа шпионов!
            </Title>
          </Space>
        </Card>

        <Card title="Шпионы">
          <List
            dataSource={spies}
            renderItem={(spy) => (
              <List.Item>
                <Text strong style={{ fontSize: 18 }}>
                  {spy.name}
                </Text>
              </List.Item>
            )}
          />
        </Card>

        <Button
          type="primary"
          size="large"
          block
          onClick={onNewGame}
          style={{ height: 50, fontSize: 18 }}
        >
          Новая игра
        </Button>
      </Space>
    </div>
  );
}
