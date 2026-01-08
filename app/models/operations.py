"""
Файл operations представляет модель для работы с финансовыми операциями в базе данных
"""
from ..database.base import Base
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

# Модель Operation представляет таблицу "operations" в базе данных для хранения финансовых операций
class Operation(Base):
    # Название таблицы в базе данных
    __tablename__ = "operations"
    
    # Первичный ключ - уникальный идентификатор операции
    id: Mapped[int] = mapped_column(primary_key=True)
    # Название операции (максимальная длина 256 символов)
    name: Mapped[str] = mapped_column(String(256))
    # Дата и время операции с учетом часового пояса
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # Сумма операции (число с плавающей точкой)
    amount: Mapped[float] = mapped_column()
    # Внешний ключ для связи с категорией операции
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    # Внешний ключ для связи с пользователем, создавшим операцию
    author: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # Связь с моделью User: каждая операция принадлежит одному пользователю
    user: Mapped["User"] = relationship("User", back_populates="operations")
    # Связь с моделью Category: каждая операция принадлежит одной категории
    category: Mapped["Category"] = relationship("Category", back_populates="operations")
    
    # Метод для строкового представления объекта Operation
    def __repr__(self) -> str:
        return f"Operation(id={self.id}, name={self.name}, date={self.date}, amount={self.amount}, category_id={self.category_id}, author={self.author})"