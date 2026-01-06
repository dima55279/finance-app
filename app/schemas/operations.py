from pydantic import BaseModel, ConfigDict, field_validator, Field
from datetime import datetime, timezone
from typing import Optional

class OperationCreate(BaseModel):
    name: str
    date: datetime
    amount: float
    categoryId: int

    @field_validator('date')
    @classmethod
    def validate_date(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)

    class Config:   
        schema_extra={
            "example": {
                "name": "Начисление стипендии",
                "date": "2025-11-25T00:00:00Z",
                "amount": 3516.48,
                "categoryId": 1,
            }
        }


class OperationUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime] = None
    amount: Optional[float] = None
    categoryId: Optional[int] = None

    @field_validator('date')
    @classmethod
    def validate_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None:
            if v.tzinfo is None:
                return v.replace(tzinfo=timezone.utc)
            return v.astimezone(timezone.utc)
        return v


class OperationResponse(BaseModel):
    id: int
    name: str
    date: datetime
    amount: float
    categoryId: int = Field(alias="category_id") 
    author: int

    @field_validator('date')
    @classmethod
    def format_date(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v.tzinfo else v.replace(tzinfo=timezone.utc).isoformat()
        }
    )