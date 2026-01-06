from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLogin(BaseModel):
    id: Optional[int] = None
    email: EmailStr
    password: str

class Config:
    schema_extra = {
        "example": {
            "id": 1,
            "email": "example@yandex.ru",
            "password": "qwerty",
        }
    }

class UserRegister(UserLogin):
    id: Optional[int] = None
    name: str
    surname: str
    email: EmailStr
    password: str
    budgetLimit: Optional[float] = 0.0
    avatar: Optional[str] = None

class Config:
    schema_extra = {
        "example": {
            "id": 1,
            "name": "Иван",
            "surname": "Иванов",
            "email": "example@yandex.ru",
            "password": "qwerty",
            "budgetLimit": 10000.0,
            "avatar": "https://example.com/avatar.jpg"
        }
    }

class UserData(UserRegister):
    pass

class UserBudgetUpdate(BaseModel):
    budgetLimit: Optional[float] = None

class Config:
    schema_extra = {
        "example": {
            "budgetLimit": 10000.0
        }
    }

class UserAvatarUpdate(BaseModel):
    avatar: Optional[str] = None

class Config:
    schema_extra = {
        "example": {
            "avatar": "https://example.com/avatar.jpg"
        }
    }