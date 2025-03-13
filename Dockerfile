# Базовый образ Playwright
FROM mcr.microsoft.com/playwright:v1.36.0

# Установите рабочую директорию
WORKDIR /app

# Скопируйте package.json и package-lock.json для установки зависимостей
COPY package.json package-lock.json ./

# Установите зависимости
RUN npm install

# Скопируйте ВСЁ содержимое проекта (включая папку tests)
COPY . .

# Установите браузеры Playwright
RUN npx playwright install

# Запустите тесты
CMD ["npx", "playwright", "test"]
