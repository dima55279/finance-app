"""
Файл categories представляет модель для работы с категориями операций в базе данных
"""
from ..database.base import Base
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Модель Category представляет таблицу "categories" в базе данных для хранения категорий операций
class Category(Base):
    # Название таблицы в базе данных
    __tablename__ = "categories"
    
    # Первичный ключ - уникальный идентификатор категории
    id: Mapped[int] = mapped_column(primary_key=True)
    # Название категории (максимальная длина 256 символов)
    name: Mapped[str] = mapped_column(String(256))
    # Цвет категории в формате HEX (например, #FF0000)
    color: Mapped[str] = mapped_column(String(7))
    # Тип категории: "income" (доход) или "expense" (расход)
    category_type: Mapped[str] = mapped_column("category_type", String(50))
    # Внешний ключ для связи с пользователем, создавшим категорию
    author: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # Связь с моделью User: каждая категория принадлежит одному пользователю
    user: Mapped["User"] = relationship("User", back_populates="categories")
    # Связь с моделью Operation: одна категория может иметь много операций
    # Каскадное удаление: при удалении категории удаляются все связанные операции
    operations: Mapped[list["Operation"]] = relationship("Operation", back_populates="category", cascade="all, delete-orphan")
    
    # Метод для строкового представления объекта Category
    def __repr__(self) -> str:
        return f"Category(id={self.id}, name={self.name}, color={self.color}, category_type={self.category_type}, author={self.author})"