const API_URL = import.meta.env.VITE_API_URL || '';

const makeRequest = async (url, email, password, errorMsg) => {
    const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    let data;
    try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.detail || data.message || `${response.status} ${response.statusText}` || errorMsg);
    }

    return data;
};

export const register = (email, password) => 
    makeRequest('/api/auth/register', email, password, 'Ошибка регистрации');

export const login = (email, password) => 
    makeRequest('/api/auth/login', email, password, 'Ошибка входа');
