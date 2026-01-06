from ..database.base import Base
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Category(Base):
    __tablename__ = "categories"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256))
    color: Mapped[str] = mapped_column(String(7))
    category_type: Mapped[str] = mapped_column("category_type", String(50))
    author: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    user: Mapped["User"] = relationship("User", back_populates="categories")
    operations: Mapped[list["Operation"]] = relationship("Operation", back_populates="category", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"Category(id={self.id}, name={self.name}, color={self.color}, category_type={self.category_type}, author={self.author})"