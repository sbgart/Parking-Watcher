// parking-monitor.js
import { getFullList, diff, isAvailable } from './api-client.js';
import { loadState, saveState } from './state-manager.js';
import { sendTelegram, MESSAGE_TEMPLATE, ALERT_TEMPLATE, CHAT_ID, formatSpotStatusForTemplate, formatSpotStatusChangeMessage } from './notification-manager.js';

async function tick(initial = false) {
 const now = new Date().toLocaleString('ru-RU');
  const state = loadState();

  const { total, available, numbers, all } = await getFullList();
  const { appeared, disappeared } = diff(state.numbers || [], numbers);

  // Получаем номер парковочного места для основного чата (установленного в переменной окружения)
  const { getUserSettings } = await import('./database.js');
  const userSettings = getUserSettings(CHAT_ID);
 const MY_PARKING_SPOT = userSettings ? userSettings.parking_spot : null;

  // Проверяем статус выбранного места, если оно задано
 let mySpotStatus = null;
  if (MY_PARKING_SPOT) {
    const mySpot = all.find(x => x.number === parseInt(MY_PARKING_SPOT));
    if (mySpot) {
      mySpotStatus = isAvailable(mySpot.status) ? 'свободно' : 'занято';
    }
  }

  // Определяем, были ли изменения
  const spotStatusChanged = MY_PARKING_SPOT && state.mySpotStatus !== null && state.mySpotStatus !== mySpotStatus;
  const changed = appeared.length > 0 || disappeared.length > 0 ||
                  (state.available !== null && state.available !== available) ||
                  spotStatusChanged;

  // Формируем текст с использованием шаблона
  const header = changed ? 'Изменения парковки' : 'Статус парковки';
  
  // Подготовим переменные для шаблона
  const templateVars = {
    header: `<b>${header}</b>`,
    timestamp: now,
    total: total,
    available: available,
    numbers: numbers.length ? numbers.join(', ') : '—',
    my_spot_status: ''
  };

  // Добавляем информацию о выбранном месте
  if (MY_PARKING_SPOT) {
    let mySpotText = formatSpotStatusForTemplate(MY_PARKING_SPOT, mySpotStatus);
    templateVars.my_spot_status = mySpotText;
  }

  // Формируем основное сообщение
  let text = MESSAGE_TEMPLATE
    .replace('{{header}}', templateVars.header)
    .replace('{{timestamp}}', templateVars.timestamp)
    .replace('{{total}}', templateVars.total)
    .replace('{{available}}', templateVars.available)
    .replace('{{numbers}}', templateVars.numbers)
    .replace('{{my_spot_status}}', templateVars.my_spot_status);
  
  // Добавляем информацию об изменении статуса моего места
  if (spotStatusChanged) {
    const statusChangeText = formatSpotStatusChangeMessage(MY_PARKING_SPOT, mySpotStatus);
    text += '\n' + statusChangeText;
    
    // Дополнительное уведомление, если место занято
    if (mySpotStatus === 'занято') {
      const alertText = ALERT_TEMPLATE
        .replace('{{spot_number}}', MY_PARKING_SPOT);
      text += '\n' + alertText;
    }
  }
  
  if (changed) {
    if (appeared.length) text += `\n➕ Появились: ${appeared.join(', ')}`;
    if (disappeared.length) text += `\n➖ Исчезли: ${disappeared.join(', ')}`;
  }

   // Отправка: первое сообщение тихое, а при изменениях — со звуком
   const silent = initial ? true : !changed;
   await sendTelegram(text, silent);

   saveState({ numbers, available, mySpotStatus });

   // Проверяем статусы для всех пользователей, которые установили свои места
   await checkAllUserSpots(all);
}

// Функция для проверки статусов мест всех пользователей
async function checkAllUserSpots(allSpots) {
  // Импортируем функцию получения всех настроек пользователей
  const { getAllUserSettings } = await import('./database.js');
  
  // Получаем всех пользователей, которые установили свои места
  const users = getAllUserSettings();
  
  for (const user of users) {
    const { chat_id, parking_spot } = user;
    
    // Пропускаем отправку сообщения в основной чат, чтобы избежать дублирования
    if (chat_id === CHAT_ID) {
      continue;
    }
    
    if (parking_spot) {
      const spot = allSpots.find(x => x.number === parking_spot);
      const spotStatus = spot ? (isAvailable(spot.status) ? 'свободно' : 'занято') : 'не найдено';
      
      // Формируем сообщение для пользователя
      let spotStatusFormatted;
      if (spotStatus === 'свободно') {
        spotStatusFormatted = `🟢 <b>${spotStatus}</b>`; // Жирный для свободного
      } else if (spotStatus === 'занято') {
        spotStatusFormatted = `🔴 <b><s>${spotStatus}</s></b>`; // Зачеркнутый для занятого
      } else {
        spotStatusFormatted = spotStatus; // Без форматирования для "не найдено"
      }
      
      const userMessage = [
        `<b>Статус вашего места</b> — ${new Date().toLocaleString('ru-RU')}`,
        `Ваше место (<code>${parking_spot}</code>): ${spotStatusFormatted}`,
        `Всего мест: ${allSpots.length}, Свободно: ${allSpots.filter(x => isAvailable(x.status)).length}`
      ].join('\n');
      
      try {
        await sendTelegram(userMessage, false, chat_id);
      } catch (error) {
        console.error(`Error sending message to user ${chat_id}:`, error.message);
      }
    }
  }
}

export { tick };