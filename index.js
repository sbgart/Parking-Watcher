// app/index.js
import process from 'node:process';
import { tick } from './parking-monitor.js';
import { checkBotUpdates } from './telegram-updates.js';
import { monitoring, telegram, validateConfig } from './config.js';

// Валидируем конфигурацию при запуске
if (!validateConfig()) {
  process.exit(1);
}

async function main() {
  console.log('🚀 Запуск Parking Watcher...');
  
  // Первый запуск — тихий
  await tick(true);
  
  // Запускаем опрос обновлений в фоне
  setInterval(async () => {
    await checkBotUpdates();
  }, telegram.updateCheckInterval);
  
  // Далее — повторяем по интервалу основную проверку
  setInterval(() => {
    tick().catch(err => console.error('tick error:', err.message));
  }, monitoring.interval);
  
  console.log(`✅ Мониторинг запущен (интервал: ${monitoring.interval / 1000}с)`);
}

main().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
