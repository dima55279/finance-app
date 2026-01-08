"""
Файл operations представляет схемы для работы с финансовыми операциями
"""
from pydantic import BaseModel, ConfigDict, field_validator, Field
from datetime import datetime, timezone
from typing import Optional

# Класс для создания операции
class OperationCreate(BaseModel):
    name: str
    date: datetime
    amount: float
    categoryId: int

    # Валидатор для приведения даты к UTC
    @field_validator('date')
    @classmethod
    def validate_date(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)

    class Config:   
        # Пример данных для документации OpenAPI
        schema_extra={
            "example": {
                "name": "Начисление стипендии",
                "date": "2025-11-25T00:00:00Z",
                "amount": 3516.48,
                "categoryId": 1,
            }
        }


# Класс для обновления операции (все поля опциональны)
class OperationUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime] = None
    amount: Optional[float] = None
    categoryId: Optional[int] = None

    # Валидатор для приведения даты к UTC (с учетом опциональности)
    @field_validator('date')
    @classmethod
    def validate_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None:
            if v.tzinfo is None:
                return v.replace(tzinfo=timezone.utc)
            return v.astimezone(timezone.utc)
        return v


# Класс ответа API для операции
class OperationResponse(BaseModel):
    id: int
    name: str
    date: datetime
    amount: float
    categoryId: int = Field(alias="category_id")  # Сопоставление с полем category_id в БД
    author: int

    # Валидатор для форматирования даты в UTC
    @field_validator('date')
    @classmethod
    def format_date(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)

    # Конфигурация модели Pydantic
    model_config = ConfigDict(
        from_attributes=True,  # Поддержка ORM
        populate_by_name=True,  # Разрешение заполнения по имени (включая alias)
        json_encoders={
            # Кодировщик для datetime в JSON (в ISO формате с часовым поясом)
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }
    )