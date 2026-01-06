from ..database.base import Base
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256))
    surname: Mapped[str] = mapped_column(String(256))
    email: Mapped[str] = mapped_column(String(256))
    password: Mapped[str] = mapped_column(String(256))
    budgetLimit: Mapped[float] = mapped_column("budget_limit", default=0.0)
    avatar: Mapped[str] = mapped_column(Text, nullable=True)
    
    categories: Mapped[list["Category"]] = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    operations: Mapped[list["Operation"]] = relationship("Operation", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"User(id={self.id}, name={self.name}, surname={self.surname}, email={self.email}, budgetLimit={self.budgetLimit}, avatar={self.avatar})"
