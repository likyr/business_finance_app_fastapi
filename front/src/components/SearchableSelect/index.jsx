import { Select, Form } from 'antd';

/**
 * Переиспользуемый компонент для поисковых полей выбора
 * @param {string} name - Имя поля формы
 * @param {string} label - Подпись поля
 * @param {Array} options - Массив опций для выбора
 * @param {string} placeholder - Плейсхолдер
 * @param {Array} rules - Правила валидации
 * @param {boolean} required - Обязательное поле
 */
function SearchableSelect({ 
    name, 
    label, 
    options = [], 
    placeholder, 
    rules = [],
    required = false 
}) {
    const formRules = required
        ? [{ required: true, message: `Пожалуйста, выберите ${label.toLowerCase()}` }, ...rules]
        : rules;

    const selectOptions = options.map(option => ({
        value: option,
        label: option
    }));

    return (
        <Form.Item
            name={name}
            label={label}
            rules={formRules}
        >
            <Select
                placeholder={placeholder}
                showSearch
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={selectOptions}
            />
        </Form.Item>
    );
}

export default SearchableSelect;














