import db from './db.js';

// Получить настройки пользователя
export function getUserSettings(chatId) {
  const stmt = db.prepare('SELECT * FROM user_settings WHERE chat_id = ?');
  return stmt.get(chatId);
}

// Обновить или создать настройки пользователя
export function updateUserSettings(chatId, parkingSpot) {
  const existing = getUserSettings(chatId);
  
  if (existing) {
    const stmt = db.prepare('UPDATE user_settings SET parking_spot = ?, updated_at = CURRENT_TIMESTAMP WHERE chat_id = ?');
    stmt.run(parkingSpot, chatId);
  } else {
    const stmt = db.prepare('INSERT INTO user_settings (chat_id, parking_spot) VALUES (?, ?)');
    stmt.run(chatId, parkingSpot);
  }
  
  return getUserSettings(chatId);
}

// Получить все настройки пользователей
export function getAllUserSettings() {
  const stmt = db.prepare('SELECT * FROM user_settings WHERE parking_spot IS NOT NULL');
  return stmt.all();
}

// Добавить запись в историю статуса места
export function addParkingHistory(spotNumber, status) {
  const stmt = db.prepare('INSERT INTO parking_history (spot_number, status) VALUES (?, ?)');
  stmt.run(spotNumber, status);
}