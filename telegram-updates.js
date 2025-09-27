// telegram-updates.js
import fs from 'node:fs';
import path from 'node:path';
import { sendTelegram } from './notification-manager.js';

const BOT_TOKEN = process.env.BOT_TOKEN || "8310853925:AAEOhH2RVCzXBIFnlhXhqn0NcSuaFGMoR4k";
const dataDir = path.resolve('./data');

// Функция для проверки обновлений сообщений от бота
async function checkBotUpdates() {
  // Получаем последнее обновление из файла состояния
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
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.ok && data.result && Array.isArray(data.result)) {
      for (const update of data.result) {
        // Обновляем ID последнего обновления
        if (update.update_id > lastUpdateId) {
          lastUpdateId = update.update_id;
        }
        
        // Обрабатываем сообщение, если оно есть
        if (update.message) {
          await processTelegramMessage(update.message);
        }
      }
      
      // Сохраняем последний ID обновления
      fs.writeFileSync(lastUpdateFile, JSON.stringify({ id: lastUpdateId }, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error checking bot updates:', error.message);
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

export { checkBotUpdates };