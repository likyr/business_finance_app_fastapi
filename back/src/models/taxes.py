
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from src.database import Base


class TaxRateEN(Base):
    __tablename__ = "tax_rates_en"

    tax_rate_id = Column(Integer, primary_key=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    tax_rate = Column(Numeric(10, 2), nullable=False)

    activity = relationship("Activity", back_populates="tax_rates_en")
    region = relationship("Region", back_populates="tax_rates_en")


class TaxRate(Base):
    """Модель налоговой ставки для процентных систем налогообложения"""
    __tablename__ = "tax_rates"

    id = Column(Integer, primary_key=True)
    tax_system_id = Column(Integer, ForeignKey("tax_system.id"), nullable=True)
    tax_type = Column(String(255), nullable=False)
    tax_rate = Column(Numeric(5, 2), nullable=False)

    tax_system = relationship("TaxSystem", back_populates="tax_rates")








