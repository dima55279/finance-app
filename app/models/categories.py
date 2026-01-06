from pydantic import BaseModel
from typing import Optional

class Category(BaseModel):
    id: Optional[int] = None
    name: str
    color: str
    category_type: str
    author: Optional[int] = None 

class Config:
    schema_extra = {
        "example": {
            "name": "Стипендия",
            "color": "#ffffff",
            "category_type": "Доход",
            "author": 1
        }
    }