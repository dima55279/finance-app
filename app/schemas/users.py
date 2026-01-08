"""
Файл users представляет схемы для работы с пользователями
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Класс для входа пользователя
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=50)

    class Config:
        # Пример данных для документации OpenAPI
        schema_extra = {
            "example": {
                "email": "example@yandex.ru",
                "password": "qwerty",
            }
        }

# Класс для регистрации пользователя (наследуется от UserLogin)
class UserRegister(UserLogin):
    name: str = Field(..., min_length=2, max_length=50)
    surname: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=255)
    budgetLimit: Optional[float] = 0.0
    avatar: Optional[str] = None

    class Config:
        # Пример данных для документации OpenAPI
        schema_extra = {
            "example": {
                "name": "Иван",
                "surname": "Иванов",
                "email": "example@yandex.ru",
                "password": "qwerty",
                "budgetLimit": 10000.0,
                "avatar": "https://example.com/avatar.jpg"
            }
        }

# Класс для обновления данных пользователя (все поля опциональны)
class UserUpdate(UserRegister):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    budgetLimit: Optional[float] = None
    avatar: Optional[str] = None

# Класс ответа API для пользователя
class UserResponse(UserRegister):
    id: int
    name: str
    surname: str
    email: EmailStr
    budgetLimit: float
    avatar: Optional[str] = None

    class Config:
        from_attributes = True  # Поддержка ORM

# Класс для обновления бюджета пользователя
class UserBudgetUpdate(UserUpdate):
    budgetLimit: float

# Класс для обновления аватара пользователя
class UserAvatarUpdate(UserUpdate):
    avatar: str