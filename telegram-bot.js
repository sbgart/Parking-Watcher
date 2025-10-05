import { getUserSettings, updateUserSettings } from "./database.js";
import { messages } from "./config.js";
import { tick } from "./parking-monitor.js";

// Функция для извлечения команды без @bot_username
function extractCommand(text) {
  if (!text) {
    return "";
  }
  // Удаляем @bot_username из команды (например, /start@mybot -> /start)
  return text.split("@")[0].trim();
}

// Обработка сообщений от пользователя
export async function handleTelegramMessage(message) {
  const chatId = String(message.chat.id);
  const text = message.text?.trim();
  const command = extractCommand(text);

  let userSettings = getUserSettings(chatId);

  if (command === "/start" || command === "/help") {
    return {
      chat_id: chatId,
      text: messages.helpMessage,
      parse_mode: "HTML",
    };
  }

  if (command?.startsWith("/spot")) {
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      return {
        chat_id: chatId,
        text: "❌ Укажите номер парковочного места.\nПример: <code>/spot 123</code>",
        parse_mode: "HTML",
      };
    }

    const spotNumber = parseInt(parts[1]);
    if (isNaN(spotNumber) || spotNumber <= 0) {
      return {
        chat_id: chatId,
        text: "❌ Неверный формат номера места. Введите положительное число.",
        parse_mode: "HTML",
      };
    }

    userSettings = updateUserSettings(chatId, spotNumber);

    return {
      chat_id: chatId,
      text: `✅ Ваше парковочное место установлено: <b>${spotNumber}</b>\nТеперь я буду отслеживать его статус.`,
      parse_mode: "HTML",
    };
  }

  if (command === "/status") {
    await tick();
    return null;
  }

  if (command === "/cancel") {
    userSettings = updateUserSettings(chatId, null);

    return {
      chat_id: chatId,
      text: "✅ Отслеживание парковочного места отменено.",
      parse_mode: "HTML",
    };
  }

  return {
    chat_id: chatId,
    text: "🤖 Неизвестная команда. Отправьте /help для списка доступных команд.",
    parse_mode: "HTML",
  };
}

// Получить номер парковочного места для чата
export function getUserParkingSpot(chatId) {
  const settings = getUserSettings(chatId);
  return settings ? settings.parking_spot : null;
}
