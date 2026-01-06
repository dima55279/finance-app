from pydantic import BaseModel
from typing import Optional

class CategoryRequest(BaseModel):
    name: str
    color: str
    category_type: str

    class Config:
        schema_extra = {
            "example": {
                "name": "Стипендия",
                "color": "#ffffff",
                "category_type": "Доход",
            }
        }

class CategoryCreate(CategoryRequest):
    pass

class CategoryUpdate(CategoryCreate):
    name: Optional[str] = None
    color: Optional[str] = None
    category_type: Optional[str] = None

class CategoryResponse(CategoryCreate):
    id: int
    name: str
    color: str
    category_type: str
    author: int

    class Config:
        from_attributes = True