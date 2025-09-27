// app/index.js
// Минимум логики: опрос API, вычисление свободных мест, сравнение со старым состоянием, Telegram.

import process from 'node:process';
import { tick } from './parking-monitor.js';
import { checkBotUpdates } from './telegram-updates.js';

const INTERVAL = Number(process.env.INTERVAL_SEC || 60);

async function main() {
  // Первый запуск — тихий
  await tick(true);
  
  // Запускаем опрос обновлений в фоне
  setInterval(async () => {
    await checkBotUpdates();
  }, 5000); // Проверяем каждые 5 секунд
  
  // Далее — повторяем по интервалу основную проверку
  setInterval(() => {
    tick().catch(err => console.error('tick error:', err.message));
  }, INTERVAL * 1000);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
