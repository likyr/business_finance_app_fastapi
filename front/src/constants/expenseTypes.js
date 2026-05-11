// Константы типов расходов
// Для изменения типов расходов отредактируйте этот массив

export const EXPENSE_TYPES = [
    'Материальные затраты',
    'Оплата труда',
    'Имущество и аренда',
    'Налоги и сборы',
    'Услуги',
    'Прочие расходы',
];

// Функция для получения фильтров для таблицы Ant Design
export const getExpenseTypeFilters = () => {
    return EXPENSE_TYPES.map(type => ({
        text: type,
        value: type,
    }));
};











