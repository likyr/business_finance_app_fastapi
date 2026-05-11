from fastapi import FastAPI

from src.api import auth, expenses, income, taxes, company, users, analytics, events
from src.database import engine, Base
from src.models.user import User
from src.models.organisation import Organisation, TaxSystem
from src.models.financial import Expense, Income
from src.models.events import ScreenViewEvent, InteractionEvent, ConversionEvent, SystemEvent

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

# Инициализация приложения
app = FastAPI(
    title="Finance App API",
    description="API для управления финансами, расходами, доходами и налогами",
    version="1.0.0"
)

# Подключение роутеров
app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(income.router)
app.include_router(taxes.router)
app.include_router(company.router)
app.include_router(users.router)
app.include_router(analytics.router)
app.include_router(events.router)

@app.get("/")
def root():
    return {"message": "Backend API is running"}

