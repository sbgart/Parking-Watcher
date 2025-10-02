// config.js - Централизованная конфигурация приложения
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env файла
dotenv.config();

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
    updateCheckInterval: parseInt(process.env.TELEGRAM_UPDATE_INTERVAL || '5000'),
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
    interval: parseInt(process.env.INTERVAL_SEC || '60') * 1000, // в миллисекундах
    initialSilent: process.env.INITIAL_SILENT === 'true',
  },

  // База данных
  database: {
    path: process.env.DB_PATH || './data/parking.db',
    backupInterval: parseInt(process.env.DB_BACKUP_INTERVAL || '86400000'), // 24 часа
  },

  // Шаблоны сообщений
  messages: {
    template: process.env.MESSAGE_TEMPLATE || `{{header}} — {{timestamp}}
Всего мест: {{total}}
Свободно: {{available}}
Номера: {{numbers}}
{{my_spot_status}}`,
    
    alertTemplate: process.env.ALERT_TEMPLATE || `⚠️ <b>ВНИМАНИЕ!</b> Ваше парковочное место <code>{{spot_number}}</code> сейчас занято!`,
    
    helpMessage: `🤖 <b>Парковочный ассистент</b>

<b>Доступные команды:</b>
<code>/spot [номер]</code> - Установить номер парковочного места
<code>/status</code> - Проверить статус вашего места
<code>/cancel</code> - Отменить отслеживание
<code>/help</code> - Список команд бота`,
  },

  // Логирование
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE || './logs/app.log',
  },

  // Docker/контейнер
  container: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
    gracefulShutdownTimeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '10000'),
  },
};

// Экспортируем отдельные секции для удобства
export const { telegram, api, monitoring, database, messages, logging, container } = config;

// Функция для валидации конфигурации
export function validateConfig() {
  const errors = [];

  // Проверяем числовые значения
  if (isNaN(config.monitoring.interval) || config.monitoring.interval <= 0) {
    errors.push('INTERVAL_SEC должен быть положительным числом');
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

// Функция для получения конфигурации в режиме разработки
export function getDevConfig() {
  return {
    ...config,
    monitoring: {
      ...config.monitoring,
      interval: 10000, // 10 секунд для разработки
    },
    logging: {
      ...config.logging,
      level: 'debug',
    },
  };
}