"""Модели организаций и справочников"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base


class TaxSystem(Base):
    """Модель системы налогообложения"""
    __tablename__ = "tax_system"

    id = Column(Integer, primary_key=True)
    system_name = Column(String(255), nullable=False)

    organisations = relationship("Organisation", back_populates="tax_system")
    tax_rates = relationship("TaxRate", back_populates="tax_system")


class Region(Base):
    """Модель региона"""
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True)
    region_name = Column(String(255), nullable=False)

    organisations = relationship("Organisation", back_populates="region")
    tax_rates_en = relationship("TaxRateEN", back_populates="region")


class Activity(Base):
    """Модель вида деятельности"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True)
    activity_name = Column(String(255), nullable=False)

    organisations = relationship("Organisation", back_populates="activity")
    tax_rates_en = relationship("TaxRateEN", back_populates="activity")


class Organisation(Base):
    """Модель организации"""
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True)
    tax_system_id = Column(Integer, ForeignKey("tax_system.id"), nullable=True)
    name = Column(String(255), nullable=False)
    unp = Column(String(255), nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    number_of_employees = Column(Integer, nullable=True)

    tax_system = relationship("TaxSystem", back_populates="organisations")
    region = relationship("Region", back_populates="organisations")
    activity = relationship("Activity", back_populates="organisations")
    users = relationship("User", back_populates="organisation")









