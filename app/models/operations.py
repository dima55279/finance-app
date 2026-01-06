from ..database.base import Base
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

class Operation(Base):
    __tablename__ = "operations"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256))
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    amount: Mapped[float] = mapped_column()
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    author: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    user: Mapped["User"] = relationship("User", back_populates="operations")
    category: Mapped["Category"] = relationship("Category", back_populates="operations")
    
    def __repr__(self) -> str:
        return f"Operation(id={self.id}, name={self.name}, date={self.date}, amount={self.amount}, category_id={self.category_id}, author={self.author})"