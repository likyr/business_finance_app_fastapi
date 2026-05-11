"""Схемы для работы с налогами"""
from pydantic import BaseModel, Field, validator
from decimal import Decimal


class TaxResponse(BaseModel):
    """Схема ответа с информацией о налоге"""
    id: int
    tax_name: str
    amount: Decimal

    class Config:
        from_attributes = True


class TaxReportCreate(BaseModel):
    """Схема для создания налогового отчета"""
    user_id: int
    period: str = Field(..., description="Период в формате YYYY-QN для квартала")

    @validator('period')
    def validate_period(cls, v):
        parts = v.split('-')
        if len(parts) != 2 or not parts[1].startswith('Q'):
            raise ValueError("Используйте формат YYYY-QN (например, 2024-Q1)")
        try:
            year = int(parts[0])
            quarter = int(parts[1][1:])
            if not (1 <= quarter <= 4):
                raise ValueError("Квартал должен быть от 1 до 4")
            if year < 2000 or year > 2100:
                raise ValueError("Год должен быть в диапазоне 2000-2100")
        except ValueError as e:
            if "invalid literal" in str(e):
                raise ValueError("Год и квартал должны быть числами")
            raise
        return v


class TaxReportResponse(BaseModel):
    """Схема ответа с информацией о налоговом отчете"""
    report_id: int
    message: str
    period: str
    period_type: str
    total_amount: Decimal

    class Config:
        from_attributes = True


class IncomeTaxTypeResponse(BaseModel):
    """Схема ответа с информацией о типе подоходного налога"""
    name: str = Field(..., description="Название типа подоходного налога")
    value: Decimal = Field(..., description="Значение ставки в процентах")

    class Config:
        from_attributes = True


class IncomeTaxTypeUpdate(BaseModel):
    """Схема для обновления типа подоходного налога"""
    name: str = Field(..., description="Название типа подоходного налога")
    value: Decimal = Field(..., description="Значение ставки в процентах", ge=0, le=100)

    @validator('value')
    def validate_value(cls, v):
        if not (0 <= float(v) <= 100):
            raise ValueError("Значение ставки должно быть от 0 до 100 процентов")
        return v




class UpdateIncomeTaxTypesResponse(BaseModel):
    """Схема ответа об успешном обновлении типов подоходного налога"""
    success: bool = True
    message: str = "Типы подоходного налога успешно обновлены"


class UnifiedTaxRateResponse(BaseModel):
    """Схема ответа с информацией о ставке единого налога"""
    region: str = Field(..., description="Название региона")
    activity_type: str = Field(..., description="Название вида деятельности")
    rate: Decimal = Field(..., description="Ставка единого налога в рублях за месяц")

    class Config:
        from_attributes = True


class UnifiedTaxRateUpdate(BaseModel):
    """Схема для обновления ставки единого налога"""
    region: str = Field(..., description="Название региона")
    activity_type: str = Field(..., description="Название вида деятельности")
    rate: Decimal = Field(..., description="Ставка единого налога в рублях за месяц", ge=0)

    @validator('rate')
    def validate_rate(cls, v):
        if float(v) < 0:
            raise ValueError("Ставка не может быть отрицательной")
        return v


class UpdateUnifiedTaxRateResponse(BaseModel):
    """Схема ответа об успешном обновлении ставки единого налога"""
    success: bool = True
    message: str = "Ставка единого налога успешно обновлена"
    region: str
    activity_type: str
    rate: Decimal

