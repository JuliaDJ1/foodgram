# Foodgram — сервис публикации рецептов

## Описание

Foodgram — это веб-приложение, где пользователи могут публиковать рецепты, добавлять их в избранное, составлять список покупок и подписываться на других авторов.

## Технологии

- Python 3.12
- Django 6.0 + Django REST Framework 3.17
- Djoser (авторизация по токену)
- PostgreSQL 15
- Gunicorn
- Docker + Docker Compose
- Nginx (reverse proxy + раздача статики)
- React (SPA, фронтенд)

## Запуск проекта локально

### Требования

- Docker
- Docker Compose

### Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/JuliaDJ1/foodgram
cd foodgram
```

2. Соберите и запустите контейнеры:

```bash
cd infra
docker compose up -d --build
```

3. Загрузите тестовые данные:

```bash
docker compose exec backend python manage.py load_data
docker compose exec backend python manage.py createsuperuser
```

4. Откройте браузер: `http://localhost:3000`

## Деплой на сервер

Сайт доступен по адресу: http://foodgramtestya.serveirc.com

Админ-зона: http://foodgramtestya.serveirc.com/admin/

## Автор

JuliaDJ1

На сайте и администратора
Email - admintest@yandex.ru
Password - 123123
