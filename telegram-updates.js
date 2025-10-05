// telegram-updates.js
import fs from 'node:fs';
import path from 'node:path';
import { sendTelegram } from './notification-manager.js';
import { telegram } from './config.js';

const dataDir = path.resolve('./data');
let isCheckingUpdates = false; // Флаг для предотвращения параллельных вызовов
let conflictErrorCount = 0;
const MAX_CONFLICT_ERRORS = 3;

// Функция для удаления webhook
async function deleteWebhook() {
  try {
    const url = `https://api.telegram.org/bot${telegram.botToken}/deleteWebhook?drop_pending_updates=true`;
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Webhook удален успешно');
      return true;
    } else {
      console.error('❌ Ошибка удаления webhook:', data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при удалении webhook:', error.message);
    return false;
  }
}

// Функция для проверки обновлений сообщений от бота
async function checkBotUpdates() {
  // Защита от параллельных вызовов
  if (isCheckingUpdates) {
    console.log('⏭️  Пропускаем проверку: предыдущий запрос еще выполняется');
    return;
  }
  
  isCheckingUpdates = true;
  
  try {
    await _checkBotUpdatesInternal();
  } finally {
    isCheckingUpdates = false;
  }
}

// Внутренняя функция с основной логикой
async function _checkBotUpdatesInternal() {
  const lastUpdateFile = path.join(dataDir, 'last_update_id.json');
  let lastUpdateId = 0;
  
  try {
    const lastUpdateData = JSON.parse(fs.readFileSync(lastUpdateFile, 'utf-8'));
    lastUpdateId = lastUpdateData.id || 0;
  } catch {
    // Если файл не существует или поврежден, начинаем с 0
  }

  try {
    const offset = lastUpdateId > 0 ? lastUpdateId + 1 : 0;
    const url = `https://api.telegram.org/bot${telegram.botToken}/getUpdates?offset=${offset}&timeout=30`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      // Обработка ошибки 409 Conflict
      if (response.status === 409) {
        conflictErrorCount++;
        
        if (conflictErrorCount === 1) {
          console.warn('⚠️  Обнаружен конфликт (HTTP 409): бот уже получает обновления из другого источника');
          console.warn('🔧 Попытка удалить webhook...');
          await deleteWebhook();
          return; // Даем время на применение изменений
        }
        
        if (conflictErrorCount >= MAX_CONFLICT_ERRORS) {
          console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось устранить конфликт после нескольких попыток');
          console.error('📋 Возможные причины:');
          console.error('   1. Бот запущен в другом месте (локально или на другом сервере)');
          console.error('   2. Установлен webhook, который не удалось удалить');
          console.error('   3. Другое приложение использует этот бот');
          console.error('');
          console.error('🔧 Решение: Остановите все другие экземпляры бота');
          
          // Сбрасываем счетчик, чтобы не спамить
          conflictErrorCount = 0;
        }
        return;
      }
      
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Сбрасываем счетчик ошибок при успешном запросе
    if (conflictErrorCount > 0) {
      console.log('✅ Конфликт устранен, продолжаем работу');
      conflictErrorCount = 0;
    }
    
    const data = await response.json();
    
    if (data.ok && data.result && Array.isArray(data.result)) {
      for (const update of data.result) {
        if (update.update_id > lastUpdateId) {
          lastUpdateId = update.update_id;
        }
        
        if (update.message) {
          await processTelegramMessage(update.message);
        }
      }
      
      fs.writeFileSync(lastUpdateFile, JSON.stringify({ id: lastUpdateId }, null, 2), 'utf-8');
    }
  } catch (error) {
    // Не показываем ошибки 409 повторно
    if (!error.message.includes('409')) {
      console.error('Error checking bot updates:', error.message);
    }
  }
}

// Импортируем функцию обработки сообщений
const { handleTelegramMessage } = await import('./telegram-bot.js');

// Функция для обработки входящих сообщений
async function processTelegramMessage(message) {
  try {
    const response = await handleTelegramMessage(message);
    if (response) {
      await sendTelegram(response.text, false, response.chat_id);
    }
  } catch (error) {
    console.error('Error processing telegram message:', error.message);
  }
}

// Функция для установки команд бота
async function setBotCommands() {
  try {
    const commands = [
      { command: 'start', description: '🚀 Начать работу с ботом' },
      { command: 'help', description: '❓ Помощь и список команд' },
      { command: 'spot', description: '🅿️ Установить номер парковочного места' },
      { command: 'status', description: '📊 Показать текущий статус' },
      { command: 'cancel', description: '❌ Отменить отслеживание' },
    ];

    const url = `https://api.telegram.org/bot${telegram.botToken}/setMyCommands`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Команды бота установлены успешно');
      return true;
    } else {
      console.error('❌ Ошибка установки команд:', data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при установке команд:', error.message);
    return false;
  }
}

export { checkBotUpdates, deleteWebhook, setBotCommands };