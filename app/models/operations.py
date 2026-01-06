from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Operation(BaseModel):
    id: Optional[int] = None
    name: str
    date: datetime
    amount: float
    categoryId: Optional[int] = None
    author: Optional[int] = None

class Config:
    schema_extra = {
        "example": {
            "id": 1,
            "name": "Начисление стипендии",
            "date": "2025-11-25",
            "amount": 3516.48,
            "categoryId": 1,
            "author": 1
        }
    }