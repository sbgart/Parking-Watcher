# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем аргумент для ветки
ARG BRANCH=main

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем git, если его нет
RUN apk add --no-cache git

# Клонируем репозиторий с указанной веткой
RUN git clone -b $BRANCH https://github.com/sbgart/Parking-Watcher.git ./

# Устанавливаем зависимости
RUN npm install

# Создаем директорию для данных и устанавливаем права
RUN mkdir -p data && chown -R node:node .

# Меняем пользователя на node для безопасности
USER node

# Устанавливаем переменные окружения по умолчанию
ENV INTERVAL_SEC=60

# Указываем команду запуска
CMD ["node", "index.js"]