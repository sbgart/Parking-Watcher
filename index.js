// app/index.js
import process from 'node:process';
import { tick } from './parking-monitor.js';
import { checkBotUpdates, setBotCommands } from './telegram-updates.js';
import { monitoring, validateConfig } from './config.js';

// Валидируем конфигурацию при запуске
if (!validateConfig()) {
  process.exit(1);
}

async function main() {
  console.log('🚀 Запуск Parking Watcher...');
  
  // Первый запуск — тихий
  await tick(true);

  // Установить команды бота
  await setBotCommands();
  
  // Бесконечный цикл для Long Polling Telegram
  async function pollUpdates() {
    while (true) {
      try {
        await checkBotUpdates();
        // Long Polling с timeout=30с уже ждал
        // Сразу следующий запрос без задержки
      } catch (error) {
        console.error('❌ Ошибка при опросе Telegram:', error.message);
        // Задержка ТОЛЬКО при ошибке, чтобы не перегружать сервер
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  // Запускаем Long Polling в фоне
  pollUpdates().catch(err => {
    console.error('❌ Критическая ошибка Long Polling:', err);
    process.exit(1);
  });
  
  // Основная проверка парковки
  setInterval(() => {
    tick().catch(err => console.error('❌ Ошибка проверки парковки:', err.message));
  }, monitoring.interval);
  
  console.log(`✅ Мониторинг парковки: каждые ${monitoring.interval / 60000} мин`);
  console.log('✅ Long Polling Telegram: непрерывно (timeout 30с)');
}

main().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
