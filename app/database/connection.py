"""
Файл connection представляет функцию инициализации базы данных и асинхронного генератора сессий.
"""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
from .base import Base

# URL для подключения к базе данных PostgreSQL с использованием asyncpg драйвера
DATABASE_URL = "postgresql+asyncpg://postgres:dima1806@localhost:5432/finance_app"

# Создание асинхронного движка SQLAlchemy для работы с базой данных
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# Создание фабрики сессий для асинхронной работы с БД
session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Асинхронный генератор для получения сессии базы данных
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with session_maker() as session:
        yield session  # Возвращает сессию для использования в обработчиках запросов

# Функция инициализации базы данных (создание всех таблиц на основе моделей)
async def init_db():
    async with engine.begin() as conn:
        # Опционально: удаление всех существующих таблиц
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Создание всех таблиц, определенных в моделях, которые наследуются от Base
        await conn.run_sync(Base.metadata.create_all)