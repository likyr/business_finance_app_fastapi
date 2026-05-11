import { useState, useEffect } from 'react';
import { Button, Form, Card, message, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/Header/AdminHeader';
import { getIncomeTaxTypes, updateIncomeTaxTypes } from '../api/taxes';
import LoadingSpinner from '../components/LoadingSpinner';
import { trackInteraction, trackScreenView } from '../api/events';

function EditIncomeTaxPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [taxTypes, setTaxTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Загрузка типов налогов
    const loadTaxTypes = async () => {
        setLoading(true);
        try {
            const data = await getIncomeTaxTypes();
            
            // Обработка разных форматов ответа от бэкенда
            let processedData = [];
            
            if (Array.isArray(data)) {
                // Если массив объектов
                processedData = data.map((item, index) => {
                    if (typeof item === 'object' && item !== null) {
                        return {
                            key: item.id || item.name || `tax_${index}`,
                            name: item.name || item.type || item.label || `Тип налога ${index + 1}`,
                            value: item.value || item.amount || item.rate || 0,
                        };
                    }
                    return null;
                }).filter(Boolean);
            } else if (typeof data === 'object' && data !== null) {
                // Если объект с ключами-названиями
                processedData = Object.entries(data).map(([name, value], index) => ({
                    key: `tax_${index}`,
                    name: name,
                    value: typeof value === 'number' ? value : parseFloat(value) || 0,
                }));
            }
            
            setTaxTypes(processedData);
            
            // Устанавливаем значения формы
            const formValues = {};
            processedData.forEach((item) => {
                formValues[item.key] = item.value;
            });
            form.setFieldsValue(formValues);
        } catch (error) {
            message.error(error.message || 'Ошибка при загрузке типов подоходного налога');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        trackScreenView('tax_settings_view', { tax_mode: 'income' });
        loadTaxTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Обработка сохранения формы
    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            // Формируем данные для отправки на бэкенд
            const taxTypesData = taxTypes.map((taxType) => ({
                name: taxType.name,
                value: values[taxType.key] || taxType.value,
            }));
            
            await updateIncomeTaxTypes(taxTypesData);
            message.success('Данные подоходного налога успешно обновлены');
            taxTypes.forEach((taxType) => {
                trackInteraction('tax_param_update', {
                    param_name: taxType.name,
                    old_value: String(taxType.value),
                });
            });
            navigate('/admin');
        } catch (error) {
            message.error(error.message || 'Ошибка при сохранении данных подоходного налога');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <AdminHeader />
            <div style={{ 
                padding: '24px', 
                maxWidth: '800px', 
                margin: '0 auto'
            }}>
                <Card
                    title="Редактирование данных о Подоходном налоге"
                    style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    {loading ? (
                        <LoadingSpinner message="Загрузка данных..." />
                    ) : taxTypes.length === 0 ? (
                        <p>Нет данных о типах подоходного налога</p>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            {taxTypes.map((taxType) => (
                                <Form.Item
                                    key={taxType.key}
                                    label={taxType.name}
                                    name={taxType.key}
                                    rules={[
                                        { required: true, message: 'Введите значение' },
                                        { type: 'number', min: 0, message: 'Значение должно быть неотрицательным' },
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        max={100}
                                        step={0.01}
                                        precision={2}
                                        placeholder="Введите значение"
                                        addonAfter="%"
                                    />
                                </Form.Item>
                            ))}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={saving}
                                >
                                    Сохранить
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default EditIncomeTaxPage;




