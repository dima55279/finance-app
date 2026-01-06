from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        schema_extra = {
            "example": {
                "email": "example@yandex.ru",
                "password": "qwerty",
            }
        }

class UserRegister(UserLogin):
    name: str
    surname: str
    email: EmailStr
    password: str
    budgetLimit: Optional[float] = 0.0
    avatar: Optional[str] = None

    class Config:
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

class UserUpdate(UserRegister):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    budgetLimit: Optional[float] = None
    avatar: Optional[str] = None

class UserResponse(UserRegister):
    id: int
    name: str
    surname: str
    email: EmailStr
    budgetLimit: float
    avatar: Optional[str] = None

    class Config:
        from_attributes = True

class UserBudgetUpdate(UserUpdate):
    budgetLimit: float

class UserAvatarUpdate(UserUpdate):
    avatar: str