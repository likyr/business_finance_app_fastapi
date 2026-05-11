"""Модели финансовых операций (расходы и доходы)"""
from sqlalchemy import Column, Integer, String, Text, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base


class Expense(Base):
    """Модель расхода"""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False)
    name = Column(String(255), nullable=True)
    type = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="expenses")


class Income(Base):
    """Модель дохода"""
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False)
    source = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="incomes")









