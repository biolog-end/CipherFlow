#!/bin/bash

# CipherFlow - SCSS Development Setup Script
# =========================================

echo "🔐 CipherFlow SCSS Development Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js и повторите попытку."
    exit 1
fi

# Check if npm is installed  
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден. Установите npm и повторите попытку."
    exit 1
fi

echo "✅ Node.js и npm найдены"

# Install dependencies
echo "📦 Установка зависимостей..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Зависимости установлены успешно"
else
    echo "❌ Ошибка при установке зависимостей"
    exit 1
fi

# Create backup of original CSS if it doesn't exist
if [ ! -f "css/style.css.backup" ]; then
    echo "💾 Создание резервной копии оригинального CSS..."
    cp css/style.css css/style.css.backup
    echo "✅ Резервная копия создана: css/style.css.backup"
fi

# Initial build
echo "🔨 Выполнение начальной сборки..."
npm run build:css

if [ $? -eq 0 ]; then
    echo "✅ Начальная сборка выполнена успешно"
else
    echo "❌ Ошибка при сборке"
    exit 1
fi

echo ""
echo "🎉 Настройка завершена!"
echo ""
echo "📋 Доступные команды:"
echo "  npm run dev        - Запуск режима разработки (автосборка)"
echo "  npm run build:css  - Создание продакшен сборки"
echo "  npm run watch:css  - Отслеживание изменений"
echo ""
echo "📁 Структура SCSS:"
echo "  scss/               - Исходные файлы"
echo "  scss/main.scss     - Точка входа"
echo "  css/style.css      - Компилированный файл" 
echo "  css/style.css.backup - Резервная копия"
echo ""
echo "🚀 Для начала разработки выполните:"
echo "     npm run dev"
echo ""
echo "📖 Документация: scss/README.md"