"""Константы приложения"""
from decimal import Decimal

# Порог дохода для определения типа ставки налога
INCOME_THRESHOLD = Decimal("500000")

# Роли пользователей
class UserRoles:
    USER = "User"
    ADMIN = "Admin"
    
    @classmethod
    def is_valid(cls, role: str) -> bool:
        return role in [cls.USER, cls.ADMIN]

# Типы периодов
class PeriodType:
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"
    
    @classmethod
    def is_valid(cls, period_type: str) -> bool:
        """Проверяет, является ли тип периода валидным"""
        return period_type in [cls.MONTH, cls.QUARTER, cls.YEAR]

# Значение по умолчанию для UNP при регистрации
DEFAULT_UNP = "123456789"

# Название организации по умолчанию
DEFAULT_ORGANISATION_NAME = "Организация"








