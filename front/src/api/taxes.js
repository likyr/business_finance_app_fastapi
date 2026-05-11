const API_URL = import.meta.env.VITE_API_URL || '';

const getHeaders = () => ({
    'Content-Type': 'application/json',
});

// Получение информации об организации
export const getCompanyInfo = async (userId) => {
    const url = userId ? `${API_URL}/api/company?user_id=${userId}` : `${API_URL}/api/company`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении информации об организации');
    }

    return response.json();
};

// Получение налоговой нагрузки с фильтрацией по периоду
export const getTaxes = async (userId, periodType, period) => {
    // periodType: 'year', 'quarter', 'month'
    // period: для year - год (2024), для quarter - строка '2024-Q1', для month - '2024-01'
    const params = new URLSearchParams({ user_id: userId });
    if (periodType) params.append('period_type', periodType);
    if (period) params.append('period', period);
    
    const url = `${API_URL}/api/taxes?${params.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении налоговой нагрузки');
    }

    return response.json();
};

// Создание отчета по налогам (скачивание файла)
export const createTaxReport = async (userId, periodType, period) => {
    const data = { user_id: userId };
    if (periodType) data.period_type = periodType;
    if (period) data.period = period;
    
    const response = await fetch(`${API_URL}/api/taxes/report`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        // Пытаемся получить JSON ошибку, если это возможно
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || error.message || 'Ошибка при создании отчета');
        } else {
            throw new Error('Ошибка при создании отчета');
        }
    }

    // Получаем файл как blob
    const blob = await response.blob();
    
    // Получаем имя файла из заголовка Content-Disposition или генерируем его
    let filename = 'tax_report.pdf';
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
        }
    }

    // Создаем временную ссылку и скачиваем файл
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Очищаем после скачивания
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
};

// Получение списка систем налогообложения
export const getTaxSystems = async () => {
    const response = await fetch(`${API_URL}/api/company/options/tax-systems`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении списка систем налогообложения');
    }

    return response.json();
};

// Получение списка регионов
export const getRegions = async () => {
    const response = await fetch(`${API_URL}/api/company/options/regions`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении списка регионов');
    }

    return response.json();
};

// Получение списка видов деятельности
export const getActivityTypes = async () => {
    const response = await fetch(`${API_URL}/api/company/options/activity-types`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error('Ошибка при получении списка видов деятельности');
    }

    return response.json();
};

// Обновление информации об организации
export const updateCompanyInfo = async (userId, companyData) => {
    const data = { user_id: userId, ...companyData };
    const response = await fetch(`${API_URL}/api/company`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при обновлении информации об организации');
    }

    return response.json();
};

// Получение типов подоходного налога и их текущих значений
export const getIncomeTaxTypes = async () => {
    const response = await fetch(`${API_URL}/api/taxes/income-tax-types`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при получении типов подоходного налога');
    }

    return response.json();
};

// Обновление значений типов подоходного налога
export const updateIncomeTaxTypes = async (taxTypes) => {
    const response = await fetch(`${API_URL}/api/taxes/income-tax-types`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(taxTypes),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при обновлении типов подоходного налога');
    }

    return response.json();
};

// Получение ставок единого налога
export const getUnifiedTaxRates = async () => {
    const response = await fetch(`${API_URL}/api/taxes/unified-tax-rates`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при получении ставок единого налога');
    }

    return response.json();
};

// Обновление ставки единого налога для конкретной пары регион-вид деятельности
export const updateUnifiedTaxRate = async (region, activityType, rate) => {
    const response = await fetch(`${API_URL}/api/taxes/unified-tax-rates`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
            region,
            activity_type: activityType,
            rate,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Ошибка при обновлении ставки единого налога');
    }

    return response.json();
};

