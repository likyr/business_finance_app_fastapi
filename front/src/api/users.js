const API_URL = import.meta.env.VITE_API_URL || '';

const getHeaders = () => ({
    'Content-Type': 'application/json',
});

// Получить всех пользователей
export const getUsers = async () => {
    const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении пользователей');
    }

    return response.json();
};

// Обновить роль пользователя
export const updateUserRole = async (userId, role) => {
    const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role }),
    });

    if (!response.ok) {
        throw new Error('Ошибка при обновлении роли пользователя');
    }

    return response.json();
};
