import { Form, Input } from 'antd';
import SearchableSelect from '../SearchableSelect';

/**
 * Компонент полей формы компании
 * @param {Array} taxSystems - Список систем налогообложения
 * @param {Array} regions - Список регионов
 * @param {Array} activityTypes - Список видов деятельности
 */
function CompanyFormFields({ taxSystems, regions, activityTypes }) {
    return (
        <>
            <SearchableSelect
                name="tax_system"
                label="Система налогообложения"
                options={taxSystems}
                placeholder="Выберите систему налогообложения"
                required
            />

            <Form.Item
                name="company_name"
                label="Название компании"
                rules={[
                    { required: true, message: 'Пожалуйста, введите название компании' },
                    { max: 255, message: 'Название компании не должно превышать 255 символов' }
                ]}
            >
                <Input placeholder="Введите название компании" />
            </Form.Item>

            <Form.Item
                name="unp"
                label="УНП"
                rules={[
                    { required: true, message: 'Пожалуйста, введите УНП' },
                    { pattern: /^\d{9}$/, message: 'УНП должен содержать 9 цифр' }
                ]}
            >
                <Input placeholder="Введите УНП (9 цифр)" maxLength={9} />
            </Form.Item>

            <SearchableSelect
                name="region"
                label="Регион"
                options={regions}
                placeholder="Выберите регион"
                required
            />

            <SearchableSelect
                name="activity_type"
                label="Вид деятельности"
                options={activityTypes}
                placeholder="Выберите вид деятельности"
                required
            />
        </>
    );
}

export default CompanyFormFields;














