import { useEffect, useState, useRef } from "react";
import { Typography } from "antd";
import { vibrateLight, vibrateMedium } from "../utils/vibration";

const { Text } = Typography;

interface TimerProps {
  timeLeft: number;
  onTimeUpdate: (newTime: number) => void;
  onTimeUp?: () => void;
  isRunning: boolean;
}

export default function Timer({
  timeLeft,
  onTimeUpdate,
  onTimeUp,
  isRunning,
}: TimerProps) {
  const [currentTime, setCurrentTime] = useState<number>(timeLeft);
  const prevTimeRef = useRef<number>(timeLeft);

  useEffect(() => {
    setCurrentTime(timeLeft);
    prevTimeRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!isRunning || currentTime <= 0) {
      // Проверяем, что таймер только что завершился (переход с >0 на 0)
      if (currentTime <= 0 && prevTimeRef.current > 0 && onTimeUp) {
        // Таймер завершился - вызываем среднюю вибрацию
        vibrateMedium();
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev - 1;

        // Проверяем, прошла ли минута (переход через границу 60 секунд)
        const prevMinutes = Math.floor(prevTimeRef.current / 60);
        const newMinutes = Math.floor(newTime / 60);

        if (newTime > 0 && prevMinutes > newMinutes) {
          // Прошла минута - вызываем легкую вибрацию
          vibrateLight();
        }

        // Проверяем, что таймер только что завершился (переход с >0 на 0)
        if (prevTimeRef.current > 0 && newTime <= 0) {
          // Таймер завершился - вызываем среднюю вибрацию
          vibrateMedium();
        }

        prevTimeRef.current = newTime;
        onTimeUpdate(newTime);

        if (newTime <= 0) {
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentTime, onTimeUp, onTimeUpdate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimeColor = (): string => {
    if (currentTime <= 60) return "#ff4444";
    if (currentTime <= 180) return "#ffaa00";
    return "#44ff44";
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Text
        strong
        style={{
          fontSize: 48,
          fontVariantNumeric: "tabular-nums",
          color: getTimeColor(),
        }}
      >
        {formatTime(currentTime)}
      </Text>
    </div>
  );
}
