"""Импорт всех моделей для удобного доступа"""
from src.models.user import User
from src.models.organisation import Organisation, TaxSystem, Region, Activity
from src.models.taxes import TaxRateEN, TaxRate
from src.models.financial import Expense, Income
from src.models.events import ScreenViewEvent, InteractionEvent, ConversionEvent, SystemEvent

__all__ = [
    "User",
    "Organisation",
    "TaxSystem",
    "Region",
    "Activity",
    "TaxRateEN",
    "TaxRate",
    "Expense",
    "Income",
    "ScreenViewEvent",
    "InteractionEvent",
    "ConversionEvent",
    "SystemEvent",
]


