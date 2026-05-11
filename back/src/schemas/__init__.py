"""Импорт всех схем для удобного доступа"""
from src.schemas.users import (
    UserRegister,
    UserLogin,
    UserResponse,
    AuthResponse,
    RoleUpdate,
    RoleUpdateResponse
)
from src.schemas.expenses import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    IncomeCreate,
    IncomeUpdate,
    IncomeResponse
)
from src.schemas.company import (
    CompanyUpdate,
    CompanyResponse,
    OptionItem,
    TaxSystemsResponse,
    RegionsResponse,
    ActivityTypesResponse
)
from src.schemas.taxes import (
    TaxResponse,
    TaxReportCreate,
    TaxReportResponse
)

__all__ = [
    # Users
    "UserRegister",
    "UserLogin",
    "UserResponse",
    "AuthResponse",
    "RoleUpdate",
    "RoleUpdateResponse",
    # Expenses
    "ExpenseCreate",
    "ExpenseUpdate",
    "ExpenseResponse",
    "IncomeCreate",
    "IncomeUpdate",
    "IncomeResponse",
    # Company
    "CompanyUpdate",
    "CompanyResponse",
    "OptionItem",
    "TaxSystemsResponse",
    "RegionsResponse",
    "ActivityTypesResponse",
    # Taxes
    "TaxResponse",
    "TaxReportCreate",
    "TaxReportResponse"
]

