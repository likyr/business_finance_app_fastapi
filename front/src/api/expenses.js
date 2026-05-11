const API_URL = import.meta.env.VITE_API_URL || '';

const getHeaders = () => ({
    'Content-Type': 'application/json',
});

// Расходы (Expenses)
export const getExpenses = async (userId) => {
    // Передаем user_id как query параметр для GET запроса
    const url = userId ? `${API_URL}/api/expenses?user_id=${userId}` : `${API_URL}/api/expenses`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении расходов');
    }

    return response.json();
};

export const createExpense = async (expenseData, userId) => {
    // Добавляем user_id в тело запроса для создания расхода
    const dataWithUserId = userId ? { ...expenseData, user_id: userId } : expenseData;
    const response = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dataWithUserId),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при создании расхода');
    }

    return response.json();
};

export const updateExpense = async (id, expenseData, userId) => {
    // Добавляем user_id в тело запроса для обновления расхода
    const dataWithUserId = userId ? { ...expenseData, user_id: userId } : expenseData;
    const response = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dataWithUserId),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при обновлении расхода');
    }

    return response.json();
};

export const deleteExpense = async (id, userId) => {
    // Передаем user_id как query параметр для DELETE запроса
    const url = userId ? `${API_URL}/api/expenses/${id}?user_id=${userId}` : `${API_URL}/api/expenses/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении расхода');
    }

    return response.ok;
};

// Доходы (Income)
export const getIncome = async (userId) => {
    // Передаем user_id как query параметр для GET запроса
    const url = userId ? `${API_URL}/api/income?user_id=${userId}` : `${API_URL}/api/income`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении доходов');
    }

    return response.json();
};

export const createIncome = async (incomeData, userId) => {
    // Добавляем user_id в тело запроса для создания дохода
    const dataWithUserId = userId ? { ...incomeData, user_id: userId } : incomeData;
    const response = await fetch(`${API_URL}/api/income`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dataWithUserId),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при создании дохода');
    }

    return response.json();
};

export const updateIncome = async (id, incomeData, userId) => {
    // Добавляем user_id в тело запроса для обновления дохода
    const dataWithUserId = userId ? { ...incomeData, user_id: userId } : incomeData;
    const response = await fetch(`${API_URL}/api/income/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dataWithUserId),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при обновлении дохода');
    }

    return response.json();
};

export const deleteIncome = async (id, userId) => {
    // Передаем user_id как query параметр для DELETE запроса
    const url = userId ? `${API_URL}/api/income/${id}?user_id=${userId}` : `${API_URL}/api/income/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении дохода');
    }

    return response.ok;
};

