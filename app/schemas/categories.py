"""
Файл categories представляет схемы для работы с категориями операций
"""
from pydantic import BaseModel
from typing import Optional

# Базовый класс запроса для категории
class CategoryRequest(BaseModel):
    name: str
    color: str
    category_type: str

    class Config:
        # Пример данных для документации OpenAPI
        schema_extra = {
            "example": {
                "name": "Стипендия",
                "color": "#ffffff",
                "category_type": "Доход",
            }
        }

# Класс для создания категории (наследуется от CategoryRequest)
class CategoryCreate(CategoryRequest):
    pass

# Класс для обновления категории (все поля опциональны)
class CategoryUpdate(CategoryCreate):
    name: Optional[str] = None
    color: Optional[str] = None
    category_type: Optional[str] = None

# Класс ответа API для категории (включает id и автора)
class CategoryResponse(CategoryCreate):
    id: int
    name: str
    color: str
    category_type: str
    author: int

    class Config:
        # Включение поддержки ORM (конвертация из объектов SQLAlchemy)
        from_attributes = True