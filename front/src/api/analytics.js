const API_URL = import.meta.env.VITE_API_URL || '';

const getHeaders = () => ({
    'Content-Type': 'application/json',
});

// Получить чистую прибыль и рентабельность
export const getProfitAndProfitability = async (userId, period, periodValue) => {
    // period: 'month', 'quarter', 'year'
    // periodValue: для месяца - 'YYYY-MM', для квартала - 'YYYY-Q1/Q2/Q3/Q4', для года - 'YYYY'
    const url = `${API_URL}/api/analytics/profit?user_id=${userId}&period=${period}&period_value=${periodValue}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении данных о прибыли');
    }

    return response.json();
};

// Получить данные для линейного графика расходов и доходов
export const getIncomeExpenseChart = async (userId, period, periodValue) => {
    const url = `${API_URL}/api/analytics/income-expense?user_id=${userId}&period=${period}&period_value=${periodValue}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении данных для графика доходов и расходов');
    }

    return response.json();
};

// Получить данные для круговой диаграммы типов расходов
export const getExpenseTypesChart = async (userId, period, periodValue) => {
    const url = `${API_URL}/api/analytics/expense-types?user_id=${userId}&period=${period}&period_value=${periodValue}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении данных о типах расходов');
    }

    return response.json();
};

// Получить данные для столбчатой диаграммы чистой прибыли по месяцам
export const getProfitByMonths = async (userId, period, periodValue) => {
    const url = `${API_URL}/api/analytics/profit-by-months?user_id=${userId}&period=${period}&period_value=${periodValue}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении данных о прибыли по месяцам');
    }

    return response.json();
};

// Получить данные для линейного графика расходов по типам
export const getExpensesByTypes = async (userId, period, periodValue) => {
    const url = `${API_URL}/api/analytics/expenses-by-types?user_id=${userId}&period=${period}&period_value=${periodValue}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении данных о расходах по типам');
    }

    return response.json();
};












