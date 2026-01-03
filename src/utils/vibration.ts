/**
 * Типы уровней вибрации для Telegram Web App
 */
type VibrationStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

/**
 * Проверяет, доступен ли Telegram Web App API
 */
function isTelegramWebAppAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Используем типы из @types/telegram-web-app
  const telegram = window.Telegram;
  return (
    telegram !== undefined &&
    telegram.WebApp !== undefined &&
    telegram.WebApp.HapticFeedback !== undefined
  );
}

/**
 * Выполняет вибрацию устройства с указанным уровнем интенсивности
 * Использует Telegram Web App API, если доступен
 * @param style - Уровень интенсивности вибрации: 'light', 'medium', 'heavy', 'rigid', 'soft'
 * @returns void
 */
function vibrate(style: VibrationStyle = "medium"): void {
  if (!isTelegramWebAppAvailable()) {
    // Если Telegram Web App не доступен, функция просто ничего не делает
    return;
  }

  try {
    // Используем типы из @types/telegram-web-app
    const telegram = window.Telegram;

    if (!telegram?.WebApp?.HapticFeedback) {
      return;
    }

    const hapticFeedback = telegram.WebApp.HapticFeedback;

    // Вызываем вибрацию с указанным стилем
    // Метод impactOccurred принимает стиль: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
    hapticFeedback.impactOccurred(style);
  } catch (error) {
    // В случае ошибки просто игнорируем
    console.warn("Ошибка при выполнении вибрации:", error);
  }
}

/**
 * Выполняет легкую вибрацию
 */
export function vibrateLight(): void {
  vibrate("light");
}

/**
 * Выполняет среднюю вибрацию
 */
export function vibrateMedium(): void {
  vibrate("medium");
}

/**
 * Выполняет сильную вибрацию
 */
export function vibrateHeavy(): void {
  vibrate("heavy");
}

/**
 * Выполняет жесткую вибрацию
 */
export function vibrateRigid(): void {
  vibrate("rigid");
}

/**
 * Выполняет мягкую вибрацию
 */
export function vibrateSoft(): void {
  vibrate("soft");
}
