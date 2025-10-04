# Используем официальный образ Node.js (версия 20 или выше для better-sqlite3)
FROM node:20-alpine

# Устанавливаем аргумент для ветки
ARG BRANCH=main

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем git и build tools для компиляции нативных модулей
# python3, make, g++ нужны для better-sqlite3
RUN apk add --no-cache git python3 make g++

# Клонируем репозиторий с указанной веткой
RUN git clone -b $BRANCH https://github.com/sbgart/Parking-Watcher.git ./

# Устанавливаем зависимости
RUN npm install

# Создаем директории для данных и логов, устанавливаем права
RUN mkdir -p data logs && chown -R node:node .

# Меняем пользователя на node для безопасности
USER node

# Устанавливаем переменные окружения по умолчанию
ENV INTERVAL_SEC=60
ENV LOG_LEVEL=info

# Указываем команду запуска
CMD ["node", "index.js"]