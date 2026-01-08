"""
Файл users представляет модель для работы с пользователями в базе данных
"""
from ..database.base import Base
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Модель User представляет таблицу "users" в базе данных для хранения информации о пользователях
class User(Base):
    # Название таблицы в базе данных
    __tablename__ = "users"
    
    # Первичный ключ - уникальный идентификатор пользователя
    id: Mapped[int] = mapped_column(primary_key=True)
    # Имя пользователя (максимальная длина 256 символов)
    name: Mapped[str] = mapped_column(String(256))
    # Фамилия пользователя (максимальная длина 256 символов)
    surname: Mapped[str] = mapped_column(String(256))
    # Email пользователя (максимальная длина 256 символов)
    email: Mapped[str] = mapped_column(String(256))
    # Хэшированный пароль пользователя (максимальная длина 256 символов)
    password: Mapped[str] = mapped_column(String(256))
    # Лимит бюджета пользователя на месяц (по умолчанию 0.0)
    budgetLimit: Mapped[float] = mapped_column("budget_limit", default=0.0)
    # Аватар пользователя в формате base64 (может быть NULL)
    avatar: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Связь с моделью Category: один пользователь может иметь много категорий
    # Каскадное удаление: при удалении пользователя удаляются все его категории
    categories: Mapped[list["Category"]] = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    # Связь с моделью Operation: один пользователь может иметь много операций
    # Каскадное удаление: при удалении пользователя удаляются все его операции
    operations: Mapped[list["Operation"]] = relationship("Operation", back_populates="user", cascade="all, delete-orphan")
    
    # Метод для строкового представления объекта User
    def __repr__(self) -> str:
        return f"User(id={self.id}, name={self.name}, surname={self.surname}, email={self.email}, budgetLimit={self.budgetLimit}, avatar={self.avatar})"
