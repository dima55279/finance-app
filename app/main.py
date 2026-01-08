"""
Файл main содержит основную логику приложения FastAPI, включая настройку CORS, подключение роутеров и обработку событий запуска приложения.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.users import user_router
from .routes.categories import category_router
from .routes.operations import operation_router
from .database.connection import init_db
import uvicorn

# Создание основного экземпляра FastAPI приложения
app = FastAPI()

# Настройка CORS (Cross-Origin Resource Sharing) для разрешения запросов с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Разрешенные источники (фронтенд на React)
    allow_credentials=True,  # Разрешение отправки учетных данных (cookies, авторизация)
    allow_methods=["*"],  # Разрешение всех HTTP методов (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],  # Разрешение всех заголовков
)

# Подключение роутеров для различных модулей приложения
app.include_router(user_router)     # Роутер для работы с пользователями
app.include_router(category_router) # Роутер для работы с категориями
app.include_router(operation_router) # Роутер для работы с операциями

# Обработчик события запуска приложения (выполняется при старте сервера)
@app.on_event("startup")
async def on_startup():
    # Инициализация базы данных (создание таблиц, если они не существуют)
    await init_db()

# Точка входа для запуска приложения напрямую (без использования командной строки)
if __name__ == '__main__':
    # Запуск сервера uvicorn с указанием приложения, хоста, порта и режима перезагрузки
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)