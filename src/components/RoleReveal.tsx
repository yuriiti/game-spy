import { useState } from "react";
import { Typography, Card, Space, Flex } from "antd";
import { Player, GameSettings, WordCategory } from "../types/game.types";
import {
  generateSpyHints,
  selectRandomWord,
  getCategoryDisplayName,
} from "../utils/gameLogic";

const { Title, Text } = Typography;

interface RoleRevealProps {
  players: Player[];
  settings: GameSettings;
  onComplete: () => void;
}

export default function RoleReveal({
  players,
  settings,
  onComplete,
}: RoleRevealProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [roleRevealed, setRoleRevealed] = useState<boolean>(false);
  const [wordData] = useState<{ word: string; category: WordCategory }>(() =>
    selectRandomWord(settings.categories)
  );
  const word = wordData.word;
  const wordCategory = wordData.category;

  const currentPlayer = players[currentIndex];
  const isLastPlayer = currentIndex === players.length - 1;

  const handleScreenClick = () => {
    if (!roleRevealed) {
      setRoleRevealed(true);
    } else {
      if (isLastPlayer) {
        onComplete();
      } else {
        setCurrentIndex(currentIndex + 1);
        setRoleRevealed(false);
      }
    }
  };

  const getRoleDisplay = (): {
    title: string;
    content: string | null;
    hints: string[];
    isSpy: boolean;
  } => {
    if (currentPlayer.isSpy) {
      const spyHints = generateSpyHints(word, wordCategory, settings);
      const hints: string[] = [];

      if (spyHints.category) {
        hints.push(`Категория: ${spyHints.category}`);
      }
      if (spyHints.letterCount !== undefined) {
        hints.push(`Количество букв: ${spyHints.letterCount}`);
      }
      if (spyHints.firstLetter) {
        hints.push(`Первая буква: ${spyHints.firstLetter}`);
      }

      return {
        title: "ВЫ ШПИОН",
        content: null,
        hints,
        isSpy: true,
      };
    }

    return {
      title: "ВЫ МИРНЫЙ ЖИТЕЛЬ",
      content: word,
      hints: [`Категория: ${getCategoryDisplayName(wordCategory)}`],
      isSpy: false,
    };
  };

  const roleDisplay = roleRevealed ? getRoleDisplay() : null;

  return (
    <div className="role-reveal" onClick={handleScreenClick}>
      {!roleRevealed ? (
        <Flex
          vertical
          align="center"
          justify="center"
          style={{ height: "100%", padding: "40px 20px" }}
        >
          <Space orientation="vertical" size="large" align="center">
            <Title level={3} type="secondary" style={{ margin: 0 }}>
              Передайте телефон
            </Title>
            <Title
              level={1}
              style={{
                color: "#4a9eff",
                fontSize: 48,
                margin: 0,
              }}
            >
              {currentPlayer.name}
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Нажмите на экран, чтобы увидеть роль
            </Text>
          </Space>
        </Flex>
      ) : (
        <Flex
          vertical
          align="center"
          style={{ padding: "20px", minHeight: "100%" }}
        >
          <Space
            align="center"
            orientation="vertical"
            size="large"
            style={{ width: "100%" }}
          >
            <Title
              level={2}
              style={{
                textAlign: "center",
                margin: 0,
                fontSize: 28,
              }}
            >
              {currentPlayer.name}
            </Title>

            <Card
              style={{
                backgroundColor: currentPlayer.isSpy ? "#2a1a1a" : "#2a2a2a",
                border: currentPlayer.isSpy
                  ? "2px solid #ff4d4f"
                  : "2px solid #434343",
                borderRadius: 16,
              }}
              styles={{ body: { padding: "32px 24px", minWidth: "300px" } }}
            >
              <Space
                orientation="vertical"
                size="middle"
                style={{ width: "100%" }}
                align="center"
              >
                <Title
                  level={4}
                  type={currentPlayer.isSpy ? "danger" : "secondary"}
                  style={{ margin: 0 }}
                >
                  {roleDisplay?.title}
                </Title>

                <Space
                  orientation="vertical"
                  size="small"
                  align="center"
                  style={{ width: "100%" }}
                >
                  {roleDisplay?.content && (
                    <Text
                      strong
                      type={roleDisplay.isSpy ? "danger" : undefined}
                      style={{
                        fontSize: 32,
                        textTransform: "capitalize",
                      }}
                    >
                      {roleDisplay.content}
                    </Text>
                  )}
                  {roleDisplay && roleDisplay.hints.length > 0 && (
                    <Space
                      orientation="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      {roleDisplay.hints.map((hint, index) => (
                        <Text
                          key={index}
                          type={roleDisplay.isSpy ? "danger" : "secondary"}
                          style={{
                            fontSize: roleDisplay.isSpy ? 20 : 16,
                          }}
                        >
                          {hint}
                        </Text>
                      ))}
                    </Space>
                  )}
                </Space>
              </Space>
            </Card>

            <Text
              type="secondary"
              style={{ fontSize: 16, textAlign: "center" }}
            >
              {isLastPlayer
                ? "Нажмите, чтобы начать игру"
                : "Нажмите для следующего игрока"}
            </Text>
          </Space>
        </Flex>
      )}
    </div>
  );
}
