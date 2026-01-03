import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Checkbox,
  Card,
  Typography,
  Space,
  Flex,
  message,
} from "antd";
import { PlusOutlined, MinusOutlined, CloseOutlined } from "@ant-design/icons";
import { Player, GameSettings, WordCategory } from "../types/game.types";
import { generatePlayerId, getCategoryDisplayName } from "../utils/gameLogic";
import {
  loadSettings,
  saveSettings,
  loadPlayers,
  savePlayers,
} from "../utils/settingsStorage";

const { Title, Text } = Typography;

interface GameSetupProps {
  onStartGame: (players: Player[], settings: GameSettings) => void;
}

const CATEGORIES: WordCategory[] = [
  "animals",
  "cities",
  "professions",
  "objects",
  "food",
  "drinks",
  "smoking",
  "entertainment",
  "relationships",
  "games",
  "hobbies",
  "holidays",
  "sports",
];

export default function GameSetup({ onStartGame }: GameSetupProps) {
  // Загружаем сохраненные настройки и игроков при монтировании
  const savedSettings = loadSettings();
  const savedPlayers = loadPlayers();

  const [playerNames, setPlayerNames] = useState<string[]>(savedPlayers);
  const [spyCount, setSpyCount] = useState<number>(savedSettings.spyCount ?? 1);
  const [categories, setCategories] = useState<WordCategory[]>(
    savedSettings.categories ?? CATEGORIES
  );
  const [timerDuration, setTimerDuration] = useState<number>(
    savedSettings.timerDuration ?? 300
  );
  const [showCategoryToSpy, setShowCategoryToSpy] = useState<boolean>(
    savedSettings.showCategoryToSpy ?? true
  );
  const [showLetterCountToSpy, setShowLetterCountToSpy] = useState<boolean>(
    savedSettings.showLetterCountToSpy ?? false
  );
  const [showFirstLetterToSpy, setShowFirstLetterToSpy] = useState<boolean>(
    savedSettings.showFirstLetterToSpy ?? false
  );

  // Сохраняем настройки при их изменении
  useEffect(() => {
    saveSettings({
      spyCount,
      categories,
      timerDuration,
      showCategoryToSpy,
      showLetterCountToSpy,
      showFirstLetterToSpy,
    });
  }, [
    spyCount,
    categories,
    timerDuration,
    showCategoryToSpy,
    showLetterCountToSpy,
    showFirstLetterToSpy,
  ]);

  // Сохраняем имена игроков при их изменении
  useEffect(() => {
    savePlayers(playerNames);
  }, [playerNames]);

  const addPlayer = () => {
    if (playerNames.length < 10) {
      setPlayerNames([...playerNames, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 3) {
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
      if (spyCount >= newNames.length) {
        setSpyCount(Math.max(1, newNames.length - 1));
      }
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    const validPlayers = playerNames
      .map((name, index) => ({ name: name.trim(), index }))
      .filter(({ name }) => name.length > 0);

    if (validPlayers.length < 3) {
      message.error("Минимум 3 игрока");
      return;
    }

    if (spyCount >= validPlayers.length) {
      message.error("Количество шпионов должно быть меньше количества игроков");
      return;
    }

    const players: Player[] = validPlayers.map(({ name }) => ({
      id: generatePlayerId(),
      name: name.trim(),
      isActive: true,
      isSpy: false,
    }));

    const settings: GameSettings = {
      spyCount,
      categories,
      timerDuration,
      showCategoryToSpy,
      showLetterCountToSpy,
      showFirstLetterToSpy,
    };

    onStartGame(players, settings);
  };

  const playerCount = playerNames.filter(
    (name) => name.trim().length > 0
  ).length;
  const maxSpies = Math.max(1, playerCount - 2);

  return (
    <div className="game-setup">
      <Title level={1} style={{ textAlign: "center", marginBottom: 24 }}>
        Настройка игры
      </Title>

      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Card title="Игроки (минимум 3, максимум 10)">
          <Space orientation="vertical" style={{ width: "100%" }} size="middle">
            {playerNames.map((name, index) => (
              <Flex key={index} gap="small" style={{ width: "100%" }}>
                <Input
                  placeholder={`Игрок ${index + 1}`}
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  size="large"
                  style={{ flex: 1 }}
                />
                {playerNames.length > 3 && (
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => removePlayer(index)}
                    size="large"
                  />
                )}
              </Flex>
            ))}
            {playerNames.length < 10 && (
              <Button
                icon={<PlusOutlined />}
                onClick={addPlayer}
                block
                type="dashed"
              >
                Добавить игрока
              </Button>
            )}
          </Space>
        </Card>

        <Card title="Количество шпионов">
          <Space size="large" align="center">
            <Button
              icon={<MinusOutlined />}
              onClick={() => setSpyCount(Math.max(1, spyCount - 1))}
              disabled={spyCount <= 1}
              size="large"
            />
            <Text
              strong
              style={{ fontSize: 24, minWidth: 40, textAlign: "center" }}
            >
              {spyCount}
            </Text>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setSpyCount(Math.min(maxSpies, spyCount + 1))}
              disabled={spyCount >= maxSpies}
              size="large"
            />
          </Space>
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            Максимум: {maxSpies}
          </Text>
        </Card>

        <Card title="Категории слов">
          <Space orientation="vertical" style={{ width: "100%" }}>
            {CATEGORIES.map((cat) => (
              <Checkbox
                key={cat}
                checked={categories.includes(cat)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCategories([...categories, cat]);
                  } else {
                    setCategories(categories.filter((c) => c !== cat));
                  }
                }}
              >
                {getCategoryDisplayName(cat)}
              </Checkbox>
            ))}
          </Space>
        </Card>

        <Card title="Время таймера (минуты)">
          <Space size="large" align="center">
            <Button
              icon={<MinusOutlined />}
              onClick={() => setTimerDuration(Math.max(60, timerDuration - 60))}
              size="large"
            />
            <Text
              strong
              style={{ fontSize: 24, minWidth: 40, textAlign: "center" }}
            >
              {Math.floor(timerDuration / 60)}
            </Text>
            <Button
              icon={<PlusOutlined />}
              onClick={() =>
                setTimerDuration(Math.min(1800, timerDuration + 60))
              }
              size="large"
            />
          </Space>
        </Card>

        <Card title="Подсказки для шпиона">
          <Space orientation="vertical" style={{ width: "100%" }}>
            <Checkbox
              checked={showCategoryToSpy}
              onChange={(e) => setShowCategoryToSpy(e.target.checked)}
            >
              Показать категорию
            </Checkbox>
            <Checkbox
              checked={showLetterCountToSpy}
              onChange={(e) => setShowLetterCountToSpy(e.target.checked)}
            >
              Показать количество букв
            </Checkbox>
            <Checkbox
              checked={showFirstLetterToSpy}
              onChange={(e) => setShowFirstLetterToSpy(e.target.checked)}
            >
              Показать первую букву
            </Checkbox>
          </Space>
        </Card>

        <Button
          type="primary"
          size="large"
          block
          onClick={handleStart}
          style={{ height: 50, fontSize: 18 }}
        >
          Начать игру
        </Button>
      </Space>
    </div>
  );
}
