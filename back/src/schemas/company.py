"""Схемы для работы с компаниями и организациями"""
from pydantic import BaseModel, Field, field_validator
from typing import Union, List
import re


class OptionItem(BaseModel):
    """Модель для опции с id, name и value"""
    id: int
    name: str
    value: str


# Union типы для поддержки обоих форматов ответа
TaxSystemsResponse = Union[List[str], List[OptionItem]]
RegionsResponse = Union[List[str], List[OptionItem]]
ActivityTypesResponse = Union[List[str], List[OptionItem]]


class CompanyUpdate(BaseModel):
    """Модель для обновления информации о компании"""
    user_id: int = Field(..., description="ID пользователя")
    tax_system: str = Field(..., description="Система налогообложения", max_length=255)
    company_name: str = Field(..., description="Название компании", max_length=255)
    unp: str = Field(..., description="УНП (уникальный налоговый номер)")
    region: str = Field(..., description="Регион", max_length=255)
    activity_type: str = Field(..., description="Вид деятельности", max_length=255)

    @field_validator("unp")
    @classmethod
    def validate_unp(cls, v: str) -> str:
        """Валидация УНП: строго 9 цифр (регулярное выражение: ^[0-9]{9}$)"""
        if not re.match(r'^[0-9]{9}$', v):
            raise ValueError("УНП должен содержать 9 цифр")
        return v


class CompanyResponse(BaseModel):
    """Модель ответа с информацией о компании"""
    tax_system: str
    company_name: str
    unp: str
    region: str
    activity_type: str

