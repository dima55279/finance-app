"""
Файл base представляет базовый класс для всех моделей SQLAlchemy.
"""
from sqlalchemy.orm import DeclarativeBase

# Базовый класс для всех моделей SQLAlchemy
class Base(DeclarativeBase):
    pass  # Наследует стандартное поведение DeclarativeBase для декларативного определения моделей