// config.js - Централизованная конфигурация приложения
import dotenv from 'dotenv';

// Определяем режим работы
const isTestMode = process.env.NODE_ENV === 'test';

// Загружаем переменные окружения из соответствующего файла
if (isTestMode) {
  dotenv.config({ path: '.env.test' });
  console.log('🔧 Загружены переменные окружения для тестового режима');
} else {
  dotenv.config();
}

// Валидация обязательных переменных окружения
const requiredEnvVars = ['BOT_TOKEN', 'CHAT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Отсутствуют обязательные переменные окружения:', missingVars.join(', '));
  console.error('Создайте файл .env на основе .env.example');
  process.exit(1);
}

// Конфигурация приложения
export const config = {
  // Telegram Bot
  telegram: {
    botToken: process.env.BOT_TOKEN,
    chatId: process.env.CHAT_ID,
  },

  // API настройки
  api: {
    url: process.env.API_URL || 'https://sibakademstroy.brusnika.ru/api/parking_spaces/?building=286&floor=-2&limit=300',
    timeout: parseInt(process.env.API_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000'),
  },

  // Мониторинг
  monitoring: {
    interval: parseInt(process.env.INTERVAL_MIN || '1') * 60 * 1000, // в миллисекундах
    initialSilent: process.env.INITIAL_SILENT === 'true',
    isTestMode: isTestMode, // Добавляем флаг тестового режима
  },

  // База данных
  database: {
    path: isTestMode ? './data/test_parking.db' : (process.env.DB_PATH || './data/parking.db'),
  },

  // Шаблоны сообщений
  messages: {
    template: process.env.MESSAGE_TEMPLATE || `{{header}} — {{timestamp}}
Всего мест: {{total}}
Свободно: {{available}}
Номера: {{numbers}}
{{my_spot_status}}`,
    
    alertTemplate: process.env.ALERT_TEMPLATE || '⚠️ <b>ВНИМАНИЕ!</b> Ваше парковочное место <code>{{spot_number}}</code> сейчас занято!',
    
    helpMessage: `🤖 <b>Парковочный ассистент</b>

<b>Доступные команды:</b>
<code>/spot [номер]</code> - Установить номер парковочного места
<code>/status</code> - Проверить статус вашего места
<code>/cancel</code> - Отменить отслеживание
<code>/help</code> - Список команд бота`,
  },
};

// Экспортируем отдельные секции для удобства
export const { telegram, api, monitoring, database, messages } = config;

// Функция для валидации конфигурации
export function validateConfig() {
  const errors = [];

  // Проверяем числовые значения
  if (isNaN(config.monitoring.interval) || config.monitoring.interval <= 0) {
    errors.push('INTERVAL_MIN должен быть положительным числом');
  }

  if (isNaN(config.api.timeout) || config.api.timeout <= 0) {
    errors.push('API_TIMEOUT должен быть положительным числом');
  }

  if (isNaN(config.api.retryAttempts) || config.api.retryAttempts < 0) {
    errors.push('API_RETRY_ATTEMPTS должен быть неотрицательным числом');
  }

  // Проверяем URL
  try {
    new URL(config.api.url);
  } catch {
    errors.push('API_URL должен быть валидным URL');
  }

  if (errors.length > 0) {
    console.error('❌ Ошибки конфигурации:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  return true;
}