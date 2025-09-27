import { getUserSettings, updateUserSettings } from './database.js';

// Обработка сообщений от пользователя
export async function handleTelegramMessage(message) {
  const chatId = String(message.chat.id);
  const userId = message.from?.id;
  const text = message.text?.trim();
  
 // Получаем текущие настройки пользователя
  let userSettings = getUserSettings(chatId);
  
  if (text === '/start' || text === '/help') {
    const helpMessage =
      `🤖 <b>Парковочный ассистент</b>\n\n` +
      `<b>Доступные команды:</b>\n` +
      `<code>/spot [номер]</code> - Установить номер парковочного места\n` +
      `<code>/status</code> - Проверить статус вашего места\n` +
      `<code>/cancel</code> - Отменить отслеживание\n` +
      `<code>/help</code> - Список команд бота`;
    
    return {
      chat_id: chatId,
      text: helpMessage,
      parse_mode: 'HTML'
    };
  }
  
  if (text?.startsWith('/spot')) {
    const parts = text.split(/\s+/);
    if (parts.length < 2) {
      return {
        chat_id: chatId,
        text: '❌ Укажите номер парковочного места.\nПример: <code>/spot 123</code>',
        parse_mode: 'HTML'
      };
    }
    
    const spotNumber = parseInt(parts[1]);
    if (isNaN(spotNumber) || spotNumber <= 0) {
      return {
        chat_id: chatId,
        text: '❌ Неверный формат номера места. Введите положительное число.',
        parse_mode: 'HTML'
      };
    }
    
    // Обновляем настройки пользователя
    userSettings = updateUserSettings(chatId, spotNumber);
    
    return {
      chat_id: chatId,
      text: `✅ Ваше парковочное место установлено: <b>${spotNumber}</b>\nТеперь я буду отслеживать его статус.`,
      parse_mode: 'HTML'
    };
  }
  
  if (text === '/status') {
    if (!userSettings || !userSettings.parking_spot) {
      return {
        chat_id: chatId,
        text: 'ℹ️ Вы не установили номер парковочного места.\nИспользуйте команду: <code>/spot [номер]</code>',
        parse_mode: 'HTML'
      };
    }
    
    return {
      chat_id: chatId,
      text: `📋 Ваше парковочное место: <b>${userSettings.parking_spot}</b>\nСтатус будет отображаться в регулярных уведомлениях.`,
      parse_mode: 'HTML'
    };
  }
  
  if (text === '/cancel') {
    userSettings = updateUserSettings(chatId, null);
    
    return {
      chat_id: chatId,
      text: '✅ Отслеживание парковочного места отменено.',
      parse_mode: 'HTML'
    };
  }
  
  // Если сообщение не распознано как команда
  return {
    chat_id: chatId,
    text: '🤖 Неизвестная команда. Отправьте /help для списка доступных команд.',
    parse_mode: 'HTML'
  };
}

// Получить номер парковочного места для чата
export function getUserParkingSpot(chatId) {
  const settings = getUserSettings(chatId);
  return settings ? settings.parking_spot : null;
}