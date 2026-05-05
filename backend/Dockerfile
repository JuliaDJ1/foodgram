FROM python:3.12-slim

WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Собираем статику
RUN python manage.py collectstatic --noinput

# Запускаем в режиме разработки
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
